package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ConsumerService
 * Manages consumer operations including product receipts, reviews, and consumption tracking
 */
@Service
@Slf4j
public class ConsumerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ActivityRepository activityRepository;

        @Autowired
        private RetailerProfileRepository retailerProfileRepository;

    @Autowired
    private SupplyChainService supplyChainService;

    /**
     * Get consumer profile
     */
    public Map<String, Object> getConsumerProfile(String email) {
        User consumer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Consumer not found"));

        if (consumer.getRole() != User.UserRole.CONSUMER) {
            throw new RuntimeException("User is not a consumer");
        }

        return Map.of(
                "id", consumer.getId(),
                "fullName", consumer.getFullName(),
                "email", consumer.getEmail(),
                "phone", consumer.getPhone() != null ? consumer.getPhone() : "",
                "role", consumer.getRole().toString()
        );
    }

    /**
     * Update consumer profile
     */
    @Transactional
    public Map<String, Object> updateConsumerProfile(String email, Map<String, Object> request) {
        User consumer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Consumer not found"));

        if (request.containsKey("fullName") && request.get("fullName") != null) {
            consumer.setFullName(request.get("fullName").toString());
        }
        if (request.containsKey("phone") && request.get("phone") != null) {
            consumer.setPhone(request.get("phone").toString());
        }

        userRepository.save(consumer);
        log.info("✅ Consumer profile updated: {}", email);

        return Map.of(
                "id", consumer.getId(),
                "fullName", consumer.getFullName(),
                "email", consumer.getEmail(),
                "phone", consumer.getPhone() != null ? consumer.getPhone() : "",
                "role", consumer.getRole().toString()
        );
    }

    /**
     * Receive batch from retailer (consumer level - product purchased)
     */
    @Transactional
    public BatchDto receiveBatch(String email, String batchId, ConsumerReceiptRequest request) {
        Long consumerId = getUserIdFromEmail(email);
        User consumer = userRepository.findById(consumerId)
                .orElseThrow(() -> new RuntimeException("Consumer not found"));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        // Update batch with consumer info
        batch.setRetailerId(consumerId); // Backward compatibility for older views
        batch.setCurrentOwnerId(consumerId);
        batch.setCurrentOwnerRole("CONSUMER");
        batch.setStatus(Batch.BatchStatus.DELIVERED);
        batchRepository.save(batch);

        // Create SOLD supply chain event (from consumer perspective)
        try {
            SupplyChainEvent consumerReceiptEvent = new SupplyChainEvent();
            consumerReceiptEvent.setBatchId(batchId);
            consumerReceiptEvent.setStage(SupplyChainEvent.SupplyChainStage.SOLD);
            consumerReceiptEvent.setActorId(consumerId);
            consumerReceiptEvent.setActorName(consumer.getFullName());
            consumerReceiptEvent.setActorRole("CONSUMER");
            consumerReceiptEvent.setLocation("Consumer Location");
            consumerReceiptEvent.setTimestamp(LocalDateTime.now());
            consumerReceiptEvent.setNotes("Product received by consumer. Purchase date: " + 
                                         (request.getPurchaseDate() != null ? request.getPurchaseDate() : "Unknown"));

            supplyChainService.logSupplyChainEvent(consumerReceiptEvent);
            log.info("✅ Consumer receipt chain event created for batch: {}", batchId);
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to create consumer receipt event: {}", e.getMessage());
        }

        createActivity(consumerId, "CONSUMER", "PRODUCT_RECEIVED",
                "Product Received", "Received batch " + batchId + " from " + request.getRetailerName(), batchId);

        return toBatchDto(batch);
    }

    /**
     * Mark batch as consumed
     */
    @Transactional
    public void markBatchAsConsumed(String email, String batchId, ConsumerConsumptionRequest request) {
        Long consumerId = getUserIdFromEmail(email);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        batch.setStatus(Batch.BatchStatus.CONSUMED);
        batchRepository.save(batch);

        // Create CONSUMED event (extension of CONSUMED)
        try {
            User consumer = userRepository.findById(consumerId)
                    .orElseThrow(() -> new RuntimeException("Consumer not found"));

            SupplyChainEvent consumedEvent = new SupplyChainEvent();
            consumedEvent.setBatchId(batchId);
            consumedEvent.setStage(SupplyChainEvent.SupplyChainStage.SOLD); // Mark as final consumption
            consumedEvent.setActorId(consumerId);
            consumedEvent.setActorName(consumer.getFullName());
            consumedEvent.setActorRole("CONSUMER");
            consumedEvent.setLocation("Consumer Location");
            consumedEvent.setTimestamp(LocalDateTime.now());
            consumedEvent.setNotes("Product fully consumed. Consumption date: " + 
                                  (request.getConsumptionDate() != null ? request.getConsumptionDate() : "Unknown") +
                                  ". Rating: " + request.getRating() + "/5");

            supplyChainService.logSupplyChainEvent(consumedEvent);
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to create consumption event: {}", e.getMessage());
        }

        createActivity(consumerId, "CONSUMER", "PRODUCT_CONSUMED",
                "Product Consumed", "Fully consumed batch " + batchId, batchId);

        log.info("✅ Batch marked as consumed by consumer: {}", batchId);
    }

    /**
     * Leave review for a batch/product
     */
    @Transactional
    public Map<String, Object> leaveReview(String email, String batchId, Map<String, Object> request) {
        Long consumerId = getUserIdFromEmail(email);

        batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Review review = Review.builder()
                .id(UUID.randomUUID().toString())
                .batchId(batchId)
                .rating(((Number) request.get("rating")).intValue())
                .comment((String) request.get("comment"))
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);

        createActivity(consumerId, "CONSUMER", "REVIEW_LEFT",
                "Review Left", "Reviewed batch " + batchId + " with " + request.get("rating") + " stars", batchId);

        log.info("✅ Review created for batch: {} by consumer: {}", batchId, email);

        return Map.of(
                "id", saved.getId(),
                "batchId", saved.getBatchId(),
                "rating", saved.getRating(),
                "comment", saved.getComment() != null ? saved.getComment() : ""
        );
    }

    /**
     * Get my products (batches purchased/received by consumer)
     */
    public List<BatchDto> getMyProducts(String email) {
        Long consumerId = getUserIdFromEmail(email);

        List<Batch> batches = batchRepository
                .findByCurrentOwnerIdAndCurrentOwnerRoleOrderByUpdatedAtDesc(consumerId, "CONSUMER");

        return batches.stream()
                .map(this::toBatchDto)
                .collect(Collectors.toList());
    }

    /**
     * Get retailer products currently available for consumers to purchase.
     */
        public List<ConsumerAvailableProductDto> getAvailableProducts(String email, String search) {
        User consumer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Consumer not found"));

        if (consumer.getRole() != User.UserRole.CONSUMER) {
            throw new RuntimeException("User is not a consumer");
        }

        List<Batch> availableBatches = batchRepository.findByStatusIn(List.of(
                Batch.BatchStatus.AVAILABLE,
                Batch.BatchStatus.LOW_STOCK
        ));

        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();

        return availableBatches.stream()
                .filter(batch -> batch.getRetailerId() != null)
                .sorted(Comparator.comparing(Batch::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(batch -> {
                    User retailer = userRepository.findById(batch.getRetailerId()).orElse(null);
                    RetailerProfile retailerProfile = retailerProfileRepository
                            .findByRetailerId(batch.getRetailerId())
                            .orElse(null);

                    String retailerName = retailer != null && retailer.getFullName() != null
                            ? retailer.getFullName()
                            : "Retailer";

                    return ConsumerAvailableProductDto.builder()
                            .id(batch.getId())
                            .cropType(batch.getCropType())
                            .variety(batch.getVariety())
                            .cropImageUrl(batch.getCropImageUrl())
                            .quantity(batch.getQuantity())
                            .quantityUnit(batch.getQuantityUnit() != null ? batch.getQuantityUnit().name() : null)
                            .pricePerUnit(batch.getPricePerUnit())
                            .qualityScore(batch.getQualityScore())
                            .status(mapBatchStatusToDisplay(batch.getStatus()))
                            .retailerName(retailerName)
                            .retailerShopName(retailerName + "'s Store")
                            .retailerPhone(retailer != null ? retailer.getPhone() : null)
                            .retailerEmail(retailer != null ? retailer.getEmail() : null)
                            .retailerAddress(retailerProfile != null ? retailerProfile.getStoreLocation() : null)
                            .retailerCity(retailerProfile != null ? retailerProfile.getStoreCity() : null)
                            .retailerState(retailerProfile != null ? retailerProfile.getStoreState() : null)
                            .build();
                })
                                .filter(product -> matchesSearch(product, normalizedSearch))
                .collect(Collectors.toList());
    }

        private boolean matchesSearch(ConsumerAvailableProductDto product, String normalizedSearch) {
                if (normalizedSearch.isEmpty()) {
                        return true;
                }

                String searchable = String.join(" ",
                                safe(product.getId()),
                                safe(product.getCropType()),
                                safe(product.getVariety()),
                                safe(product.getRetailerName()),
                                safe(product.getRetailerShopName()),
                                safe(product.getRetailerCity()),
                                safe(product.getRetailerState())
                ).toLowerCase();

                return searchable.contains(normalizedSearch);
        }

        private String safe(String value) {
                return value == null ? "" : value;
        }

    /**
     * Get my reviews
     */
    public List<Map<String, Object>> getMyReviews(String email) {
        Long consumerId = getUserIdFromEmail(email);

        List<Review> reviews = reviewRepository.findAll()
                .stream()
                .filter(r -> r.getUserId().equals(consumerId))
                .collect(Collectors.toList());

        return reviews.stream()
                .map(r -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", r.getId());
                    data.put("batchId", r.getBatchId());
                    data.put("rating", r.getRating());
                    data.put("comment", r.getComment() != null ? r.getComment() : "");
                    return data;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get reviews for a specific batch
     */
    public List<Map<String, Object>> getBatchReviews(String batchId) {
        List<Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> r.getBatchId().equals(batchId))
                .collect(Collectors.toList());

        return reviews.stream()
                .map(r -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", r.getId());
                    data.put("batchId", r.getBatchId());
                    data.put("rating", r.getRating());
                    data.put("comment", r.getComment() != null ? r.getComment() : "");
                    return data;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get product traceability journey (consumer view)
     */
    public Map<String, Object> getProductJourney(String email, String batchId) {
        getUserIdFromEmail(email);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        // Get supply chain history
        List<SupplyChainEvent> journey = supplyChainService.getSupplyChainWithVerification(batchId);

        List<Map<String, Object>> formattedJourney = journey.stream()
                .map(event -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("stage", event.getStage().toString());
                    data.put("timestamp", event.getTimestamp().toString());
                    data.put("location", event.getLocation() != null ? event.getLocation() : "N/A");
                    data.put("actor", event.getActorName() != null ? event.getActorName() : "Unknown");
                    data.put("role", event.getActorRole() != null ? event.getActorRole() : "Unknown");
                    data.put("quality", event.getQualityScore() != null ? event.getQualityScore() : "N/A");
                    return data;
                })
                .collect(Collectors.toList());

        return Map.of(
                "batchId", batchId,
                "cropType", batch.getCropType(),
                "variety", batch.getVariety(),
                "journey", formattedJourney,
                "verified", true
        );
    }

    // ========== HELPER METHODS ==========

    private Long getUserIdFromEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private void createActivity(Long userId, String userRole, String actionType,
                               String title, String description, String batchId) {
        Activity activity = Activity.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .userRole(userRole)
                .actionType(actionType)
                .title(title)
                .description(description)
                .batchId(batchId)
                .build();
        activityRepository.save(activity);
    }

    private BatchDto toBatchDto(Batch batch) {
        return BatchDto.builder()
                .id(batch.getId())
                .cropType(batch.getCropType())
                .variety(batch.getVariety())
                .quantity(batch.getQuantity())
                                .quantityUnit(batch.getQuantityUnit() != null ? batch.getQuantityUnit().name() : null)
                .pricePerUnit(batch.getPricePerUnit())
                .qualityGrade(batch.getQualityGrade())
                .qualityScore(batch.getQualityScore())
                                .status(batch.getStatus() != null ? batch.getStatus().name() : null)
                .farmCity(batch.getFarmCity())
                .farmState(batch.getFarmState())
                .storageType(batch.getStorageType())
                .currentShelfLifeDays(batch.getCurrentShelfLifeDays())
                .organic(batch.getOrganic())
                .certifications(batch.getCertifications())
                                .cropImageUrl(batch.getCropImageUrl())
                .qrCodeUrl(batch.getQrCodeUrl())
                .build();
    }

        private String mapBatchStatusToDisplay(Batch.BatchStatus status) {
                if (status == null) return "Unknown";
                return switch (status) {
                        case AVAILABLE -> "Available";
                        case LOW_STOCK -> "Low Stock";
                        case DELIVERED -> "Sold Out";
                        case EXPIRED -> "Expired";
                        default -> status.name();
                };
        }


}
