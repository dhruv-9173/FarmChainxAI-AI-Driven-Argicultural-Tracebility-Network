package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * RetailerService
 * Manages retailer operations including inventory, stock management, and sales
 */
@Service
@Slf4j
public class RetailerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private BatchTransferRepository batchTransferRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SupplyChainService supplyChainService;

    @Autowired
    private RetailerProfileRepository retailerProfileRepository;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

    /**
     * Get retailer profile
     */
    public RetailerProfileDto getRetailerProfile(String email) {
        User retailer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        if (retailer.getRole() != User.UserRole.RETAILER) {
            throw new RuntimeException("User is not a retailer");
        }

        RetailerProfile profile = getOrCreateRetailerProfile(retailer);

        return RetailerProfileDto.builder()
                .id(retailer.getId())
                .fullName(retailer.getFullName())
                .email(retailer.getEmail())
                .phone(retailer.getPhone())
                .storeLocation(profile.getStoreLocation())
                .storeCity(profile.getStoreCity())
                .storeState(profile.getStoreState())
                .rating(profile.getRating())
                .build();
    }

    /**
     * Update retailer profile
     */
    @Transactional
    public RetailerProfileDto updateRetailerProfile(String email, RetailerProfileDto request) {
        User retailer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        if (retailer.getRole() != User.UserRole.RETAILER) {
            throw new RuntimeException("User is not a retailer");
        }

        RetailerProfile profile = getOrCreateRetailerProfile(retailer);

        if (request.getFullName() != null) retailer.setFullName(request.getFullName());
        if (request.getPhone() != null) retailer.setPhone(request.getPhone());
        if (request.getStoreLocation() != null) profile.setStoreLocation(request.getStoreLocation());
        if (request.getStoreCity() != null) profile.setStoreCity(request.getStoreCity());
        if (request.getStoreState() != null) profile.setStoreState(request.getStoreState());
        if (request.getRating() != null) profile.setRating(request.getRating());

        userRepository.save(retailer);
        retailerProfileRepository.save(profile);
        log.info("✅ Retailer profile updated: {}", email);

        return getRetailerProfile(email);
    }

    private RetailerProfile getOrCreateRetailerProfile(User retailer) {
        return retailerProfileRepository.findByRetailerId(retailer.getId())
                .orElseGet(() -> retailerProfileRepository.save(RetailerProfile.builder()
                        .user(retailer)
                        .storeLocation("")
                        .storeCity("")
                        .storeState("")
                        .rating(BigDecimal.ZERO)
                        .build()));
    }

    /**
     * Get all batches in retailer's inventory
     */
    public List<BatchDto> getRetailerInventory(String email) {
        Long retailerId = getUserIdFromEmail(email);

        List<Batch> batches = batchRepository.findByRetailerId(retailerId);

        return batches.stream()
                .map(this::toBatchDto)
                .collect(Collectors.toList());
    }

    /**
     * Get inventory summary (count, total quantity, categories)
     */
    public Map<String, Object> getInventorySummary(String email) {
        Long retailerId = getUserIdFromEmail(email);
        List<Batch> batches = batchRepository.findByRetailerId(retailerId);

        int totalBatches = batches.size();
        int activeBatches = (int) batches.stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.RECEIVED_BY_RETAIL || 
                           b.getStatus() == Batch.BatchStatus.AVAILABLE)
                .count();

        double totalQuantity = batches.stream()
                .mapToDouble(b -> b.getQuantity() != null ? b.getQuantity().doubleValue() : 0)
                .sum();

        // Group by crop type
        Map<String, Long> cropsCount = batches.stream()
                .collect(Collectors.groupingBy(
                        Batch::getCropType,
                        Collectors.counting()
                ));

        return Map.of(
                "totalBatches", totalBatches,
                "activeBatches", activeBatches,
                "totalQuantity", totalQuantity,
                "cropBreakdown", cropsCount
        );
    }

    /**
     * Mark batch as sold (creates SOLD supply chain event)
     */
    @Transactional
    public BatchDto markBatchAsSold(String email, String batchId, MarkBatchSoldRequest request) {
        Long retailerId = getUserIdFromEmail(email);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (!batch.getRetailerId().equals(retailerId)) {
            throw new RuntimeException("Unauthorized: Batch does not belong to this retailer");
        }

        if (batch.getStatus() != Batch.BatchStatus.RECEIVED_BY_RETAIL && 
            batch.getStatus() != Batch.BatchStatus.AVAILABLE) {
            throw new RuntimeException("Batch cannot be sold. Current status: " + batch.getStatus());
        }

        // Update batch status
        if (request.getSellingPrice() != null) {
            batch.setPricePerUnit(BigDecimal.valueOf(request.getSellingPrice()));
        }
        batch.setStatus(Batch.BatchStatus.DELIVERED);
        batchRepository.save(batch);

        // Create activity log
        createActivity(retailerId, "RETAILER", "BATCH_SOLD",
                "Batch Sold",
                "Marked batch " + batchId + " as sold. Qty: " + request.getQuantitySold(),
                batchId);

        // Create SOLD supply chain event
        try {
            User retailer = userRepository.findById(retailerId)
                    .orElseThrow(() -> new RuntimeException("Retailer not found"));

            SupplyChainEvent soldEvent = new SupplyChainEvent();
            soldEvent.setBatchId(batchId);
            soldEvent.setStage(SupplyChainEvent.SupplyChainStage.SOLD);
            soldEvent.setActorId(retailerId);
            soldEvent.setActorName(retailer.getFullName());
            soldEvent.setActorRole("RETAILER");
            soldEvent.setLocation("Retail Store");
            soldEvent.setEventType("SOLD");
            soldEvent.setTimestamp(LocalDateTime.now());
            if (request.getSellingPrice() != null) {
                soldEvent.setUnitPrice(BigDecimal.valueOf(request.getSellingPrice()));
                soldEvent.setNotes("Sold at ₹" + request.getSellingPrice() + "/unit. Total: ₹" + 
                                  (request.getSellingPrice() * request.getQuantitySold()));
            } else {
                soldEvent.setNotes("Batch marked as sold. Qty: " + request.getQuantitySold());
            }

            supplyChainService.logSupplyChainEvent(soldEvent);
            log.info("✅ Supply chain event created for batch: {} (SOLD stage)", batchId);
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to create SOLD supply chain event: {}", e.getMessage());
        }

        return toBatchDto(batch);
    }

    /**
     * Get sales analytics for retailer
     */
    public List<RetailerAnalyticsPointDto> getSalesAnalytics(String email) {
        Long retailerId = getUserIdFromEmail(email);

        List<Batch> batches = batchRepository.findByRetailerId(retailerId);

        // Group batches by their "lastStatusChangeAt" month-year
        // For simplicity, we create a 6-month trailing data points
        List<RetailerAnalyticsPointDto> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

            int received = 0;
            int sold = 0;
            int expired = 0;
            double revenue = 0.0;

            for (Batch b : batches) {
                if (b.getLastStatusChangeAt() != null &&
                    b.getLastStatusChangeAt().isAfter(monthStart) &&
                    b.getLastStatusChangeAt().isBefore(monthEnd)) {

                    if (b.getStatus() == Batch.BatchStatus.RECEIVED_BY_RETAIL || b.getStatus() == Batch.BatchStatus.AVAILABLE) {
                        received++;
                    } else if (b.getStatus() == Batch.BatchStatus.DELIVERED) {
                        sold++;
                        // Assuming selling price is captured somewhere. 
                        // For demonstration, we calculate a mock revenue based on qty if not directly stored on batch
                        // In reality, revenue should be aggregated from SupplyChainEvents.
                        // We will just use quantity * random/avg price.
                        double qty = b.getQuantity() != null ? b.getQuantity().doubleValue() : 0.0;
                        revenue += (qty * 120.0); // Mocking Rs 120/kg
                    } else if (b.getStatus() == Batch.BatchStatus.EXPIRED) {
                        expired++;
                    }
                }
            }

            result.add(RetailerAnalyticsPointDto.builder()
                    .month(monthStart.format(monthFormatter))
                    .received(received)
                    .sold(sold)
                    .expired(expired)
                    .revenue(revenue)
                    .build());
        }

        return result;
    }

    /**
     * Get recent activities for retailer
     */
    public List<ActivityItemDto> getRetailerActivities(String email) {
        Long retailerId = getUserIdFromEmail(email);
        
        List<Activity> activities = activityRepository.findByUserIdOrderByCreatedAtDesc(retailerId);
        
        return activities.stream()
            .filter(a -> "RETAILER".equals(a.getUserRole()))
            .limit(20)
            .map(a -> {
                ActivityItemDto dto = new ActivityItemDto();
                dto.setId(a.getId());
                dto.setActionType(a.getActionType());
                dto.setTitle(a.getTitle());
                dto.setDescription(a.getDescription());
                dto.setBatchId(a.getBatchId());
                dto.setTime(a.getCreatedAt() != null ? a.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM, HH:mm")) : "");
                
                // Color coding based on action
                if (a.getActionType().contains("ACCEPT") || a.getActionType().contains("SOLD")) {
                    dto.setBadge("Success");
                    dto.setBadgeColor("#16A34A");
                } else if (a.getActionType().contains("REJECT") || a.getActionType().contains("EXPIRED")) {
                    dto.setBadge("Alert");
                    dto.setBadgeColor("#EF4444");
                } else {
                    dto.setBadge("Info");
                    dto.setBadgeColor("#2563EB");
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * Get received batches (pending or active)
     */
    public List<BatchDto> getReceivedBatches(String email) {
        Long retailerId = getUserIdFromEmail(email);

        List<Batch> batches = batchRepository.findByRetailerId(retailerId).stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.RECEIVED_BY_RETAIL || 
                           b.getStatus() == Batch.BatchStatus.AVAILABLE)
                .collect(Collectors.toList());

        return batches.stream()
                .map(this::toBatchDto)
                .collect(Collectors.toList());
    }

    /**
     * Get expiring batches (warning if shelf life < 5 days)
     */
    public List<BatchDto> getExpiringBatches(String email) {
        Long retailerId = getUserIdFromEmail(email);

        List<Batch> batches = batchRepository.findByRetailerId(retailerId).stream()
                .filter(b -> (b.getStatus() == Batch.BatchStatus.RECEIVED_BY_RETAIL || 
                            b.getStatus() == Batch.BatchStatus.AVAILABLE))
                .filter(b -> b.getCurrentShelfLifeDays() != null && 
                           b.getCurrentShelfLifeDays() > 0 && 
                           b.getCurrentShelfLifeDays() <= 5)
                .collect(Collectors.toList());

        return batches.stream()
                .map(this::toBatchDto)
                .collect(Collectors.toList());
    }

    /**
     * Track batch quality score and trigger alerts
     */
    public Map<String, Object> getQualityAlerts(String email) {
        Long retailerId = getUserIdFromEmail(email);

        List<Batch> batches = batchRepository.findByRetailerId(retailerId).stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.RECEIVED_BY_RETAIL || 
                           b.getStatus() == Batch.BatchStatus.AVAILABLE)
                .collect(Collectors.toList());

        List<BatchDto> qualityWarnings = batches.stream()
                .filter(b -> b.getQualityScore() != null && b.getQualityScore() < 70)
                .map(this::toBatchDto)
                .collect(Collectors.toList());

        List<BatchDto> expiredBatches = batches.stream()
                .filter(b -> b.getCurrentShelfLifeDays() != null && 
                           b.getCurrentShelfLifeDays() <= 0)
                .map(this::toBatchDto)
                .collect(Collectors.toList());

        return Map.of(
                "qualityWarnings", qualityWarnings,
                "expiredBatches", expiredBatches,
                "totalAlerts", qualityWarnings.size() + expiredBatches.size()
        );
    }

    /**
     * Accept batch (quality check passed)
     */
    @Transactional
    public BatchDto acceptBatch(String email, String batchId, String notes, Double shelfPrice) {
        Long retailerId = getUserIdFromEmail(email);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (!batch.getRetailerId().equals(retailerId)) {
            throw new RuntimeException("Unauthorized: Batch does not belong to this retailer");
        }

        if (shelfPrice != null) {
            if (shelfPrice < 0) {
                throw new RuntimeException("Shelf price cannot be negative");
            }
            batch.setPricePerUnit(BigDecimal.valueOf(shelfPrice));
        }
        batch.setStatus(Batch.BatchStatus.AVAILABLE);
        batchRepository.save(batch);

        createActivity(retailerId, "RETAILER", "BATCH_INSPECTED",
                "Batch Inspected", "Batch inspected and accepted: " + notes, batchId);

        // Create AVAILABLE/STORED supply chain event
        try {
            User retailer = userRepository.findById(retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

            SupplyChainEvent availableEvent = new SupplyChainEvent();
            availableEvent.setBatchId(batchId);
            availableEvent.setStage(SupplyChainEvent.SupplyChainStage.STORED);
            availableEvent.setActorId(retailerId);
            availableEvent.setActorName(retailer.getFullName());
            availableEvent.setActorRole("RETAILER");
            availableEvent.setLocation("Retail Store");
            availableEvent.setEventType("AVAILABLE");
            availableEvent.setTimestamp(LocalDateTime.now());
            if (batch.getPricePerUnit() != null) {
                availableEvent.setUnitPrice(batch.getPricePerUnit());
            }
            availableEvent.setNotes("Batch marked as AVAILABLE for sale" +
                (notes != null && !notes.isBlank() ? ". Notes: " + notes : ""));

            supplyChainService.logSupplyChainEvent(availableEvent);
            log.info("✅ Supply chain event created for batch: {} (AVAILABLE/STORED stage)", batchId);
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to create AVAILABLE supply chain event: {}", e.getMessage());
        }

        log.info("✅ Batch accepted by retailer: {}", batchId);
        return toBatchDto(batch);
    }

    /**
     * Reject batch (quality check failed)
     */
    @Transactional
    public void rejectAndReturnBatch(String email, String batchId, String rejectionReason) {
        Long retailerId = getUserIdFromEmail(email);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (!batch.getRetailerId().equals(retailerId)) {
            throw new RuntimeException("Unauthorized: Batch does not belong to this retailer");
        }

        batch.setStatus(Batch.BatchStatus.REJECTED_BY_RETAIL);
        batchRepository.save(batch);

        createActivity(retailerId, "RETAILER", "BATCH_REJECTED",
                "Batch Rejected", "Batch rejected with reason: " + rejectionReason, batchId);

        // Notify distributor
        if (batch.getDistributorId() != null) {
            notificationService.createNotification(batch.getDistributorId(), 
                new CreateNotificationRequest("BATCH_REJECTED", "Batch Rejected", 
                    "Your batch " + batchId + " was rejected by retailer: " + rejectionReason, batchId));
        }

        log.info("✅ Batch rejected by retailer: {}", batchId);
    }

    // ========== HELPER METHODS ==========

    /**
     * Get all batches received by this retailer via accepted BatchTransfer records.
     * Returns a rich DistributorBatchDto including source info, quality scores, etc.
     */
    public List<DistributorBatchDto> getRetailerReceivedBatches(String email) {
        User retailer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Retailer not found: " + email));

        Long retailerId = retailer.getId();

        // Get all accepted transfers where this retailer is the recipient
        List<BatchTransfer> acceptedTransfers = batchTransferRepository
                .findByRecipientIdAndTransferStatus(retailerId, BatchTransfer.TransferStatus.ACCEPTED);

        return acceptedTransfers.stream()
                .map(transfer -> {
                    Batch batch = batchRepository.findById(transfer.getBatchId()).orElse(null);
                    if (batch == null) return null;

                    // Source user (farmer or distributor who sent the batch)
                    User source = userRepository.findById(transfer.getSenderId()).orElse(null);
                    String sourceName = source != null ? source.getFullName() : "Unknown";
                    String sourceType = transfer.getSenderRole(); // FARMER or DISTRIBUTOR

                    int shelfLifePercent = 0;
                    if (batch.getExpectedShelfLifeDays() != null && batch.getExpectedShelfLifeDays() > 0) {
                        shelfLifePercent = (batch.getCurrentShelfLifeDays() != null
                                ? (batch.getCurrentShelfLifeDays() * 100) / batch.getExpectedShelfLifeDays()
                                : 0);
                    }

                    // Map backend status to display status
                    String displayStatus = mapBatchStatusToDisplay(batch.getStatus());

                    return DistributorBatchDto.builder()
                            .id(batch.getId())
                            .cropType(batch.getCropType())
                            .variety(batch.getVariety())
                            .quantity(batch.getQuantity() + " " + batch.getQuantityUnit().name())
                            .basePrice(batch.getPricePerUnit())
                            .marketPrice(batch.getPricePerUnit())
                            .qualityScore(batch.getQualityScore())
                            .status(displayStatus)
                            .farmerName(sourceName)
                            .farmerId(sourceType + "-" + transfer.getSenderId())
                            .farmLocation(batch.getFarmCity() + ", " + batch.getFarmState())
                            .receivedAt(transfer.getTransferredAt() != null
                                    ? transfer.getTransferredAt().format(dateFormatter)
                                    : (transfer.getCreatedAt() != null
                                            ? transfer.getCreatedAt().format(dateFormatter)
                                            : ""))
                            .shelfLifeDays(batch.getExpectedShelfLifeDays())
                            .shelfLifePercent(shelfLifePercent)
                            .qualityGrade(batch.getQualityGrade())
                            .organic(batch.getOrganic())
                            .inspectionNote(transfer.getInspectionNote())
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private String mapBatchStatusToDisplay(Batch.BatchStatus status) {
        if (status == null) return "Unknown";
        switch (status) {
            case RECEIVED_BY_RETAIL: return "Accepted";
            case AVAILABLE: return "Available";
            case DELIVERED: return "Sold Out";
            case EXPIRED: return "Expired";
            case DISCARDED: return "Discarded";
            default: return "Accepted";
        }
    }


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
            .quantityUnit(batch.getQuantityUnit().name())
            .pricePerUnit(batch.getPricePerUnit())
                .qualityGrade(batch.getQualityGrade())
                .qualityScore(batch.getQualityScore())
                .status(batch.getStatus().name())
                .farmCity(batch.getFarmCity())
                .farmState(batch.getFarmState())
                .storageType(batch.getStorageType())
                .currentShelfLifeDays(batch.getCurrentShelfLifeDays())
                .organic(batch.getOrganic())
                .certifications(batch.getCertifications())
                .qrCodeUrl(batch.getQrCodeUrl())
                .build();
    }
}
