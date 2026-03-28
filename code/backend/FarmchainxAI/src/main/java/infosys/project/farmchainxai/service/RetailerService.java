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

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    /**
     * Get retailer profile
     */
    public RetailerProfileDto getRetailerProfile(String email) {
        User retailer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        if (retailer.getRole() != User.UserRole.RETAILER) {
            throw new RuntimeException("User is not a retailer");
        }

        return RetailerProfileDto.builder()
                .id(retailer.getId())
                .fullName(retailer.getFullName())
                .email(retailer.getEmail())
                .phone(retailer.getPhone())
                .storeLocation(retailer.getPhone() != null ? "Store" : "Unknown")
                .storeCity("City")
                .storeState("State")
                .build();
    }

    /**
     * Update retailer profile
     */
    @Transactional
    public RetailerProfileDto updateRetailerProfile(String email, RetailerProfileDto request) {
        User retailer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        if (request.getFullName() != null) retailer.setFullName(request.getFullName());
        if (request.getPhone() != null) retailer.setPhone(request.getPhone());

        userRepository.save(retailer);
        log.info("✅ Retailer profile updated: {}", email);

        return getRetailerProfile(email);
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
            soldEvent.setTimestamp(LocalDateTime.now());
            if (request.getSellingPrice() != null) {
                soldEvent.setNotes("Sold at ₹" + request.getSellingPrice() + "/unit. Total: ₹" + 
                                  (request.getSellingPrice() * request.getQuantitySold()));
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
    public Map<String, Object> getSalesAnalytics(String email) {
        Long retailerId = getUserIdFromEmail(email);

        List<Batch> soldBatches = batchRepository.findByRetailerId(retailerId).stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.DELIVERED)
                .collect(Collectors.toList());

        int totalSold = soldBatches.size();
        double totalQuantitySold = soldBatches.stream()
                .mapToDouble(b -> b.getQuantity() != null ? b.getQuantity().doubleValue() : 0)
                .sum();

        // Group by crop type for sales breakdown
        Map<String, Long> salesByType = soldBatches.stream()
                .collect(Collectors.groupingBy(
                        Batch::getCropType,
                        Collectors.counting()
                ));

        return Map.of(
                "totalBatchesSold", totalSold,
                "totalQuantitySold", totalQuantitySold,
                "salesBreakdown", salesByType,
                "averageQualityScore", soldBatches.stream()
                        .mapToDouble(b -> b.getQualityScore() != null ? b.getQualityScore() : 0)
                        .average()
                        .orElse(0.0)
        );
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
    public BatchDto acceptBatch(String email, String batchId, String notes) {
        Long retailerId = getUserIdFromEmail(email);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (!batch.getRetailerId().equals(retailerId)) {
            throw new RuntimeException("Unauthorized: Batch does not belong to this retailer");
        }

        batch.setStatus(Batch.BatchStatus.AVAILABLE);
        batchRepository.save(batch);

        createActivity(retailerId, "RETAILER", "BATCH_INSPECTED",
                "Batch Inspected", "Batch inspected and accepted: " + notes, batchId);

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
