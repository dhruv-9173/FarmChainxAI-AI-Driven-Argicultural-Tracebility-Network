package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "batches", indexes = {
        @Index(name = "idx_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_distributor_id", columnList = "distributor_id"),
        @Index(name = "idx_retailer_id", columnList = "retailer_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    private String id;

    @Column(nullable = false)
    private Long farmerId;

    @Column
    private Long distributorId;

    @Column
    private Long retailerId;

    @Column(nullable = false)
    private String cropType;

    @Column
    private String variety;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal quantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal pricePerUnit;

    @Column
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private QuantityUnit quantityUnit = QuantityUnit.kg;

    @Column
    @Builder.Default
    private Integer qualityScore = 0; // 0-100

    @Column
    private String qualityGrade;

    @Column
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BatchStatus status = BatchStatus.CREATED;

    @Column
    private String farmId;

    @Column
    private String farmCity;

    @Column
    private String farmState;

    @Column
    private String storageType;

    @Column
    private String storageLocation;

    @Column
    private String soilType;

    @Column
    private String irrigationType;

    // Quality & Shelf Life
    @Column
    private Integer expectedShelfLifeDays;

    @Column
    private Integer currentShelfLifeDays;

    @Column(precision = 5, scale = 2)
    private BigDecimal moistureLevel;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean organic = false;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean gapCertified = false;

    @Column(columnDefinition = "JSON")
    private String certifications; // JSON array

    // Supply Chain Tracking Fields (UNIFIED OWNERSHIP MODEL)
    @Column
    private Long currentOwnerId; // ID of current batch owner (farmer/distributor/retailer/consumer)

    @Column
    private String currentOwnerRole; // Role of current owner (FARMER, DISTRIBUTOR, RETAILER, CONSUMER)

    @Column(columnDefinition = "JSON")
    private String ownershipHistory; // JSON array tracking all ownership changes: [{userId, role, acquiredAt, transferredAt}, ...]

    @Column
    private LocalDateTime lastStatusChangeAt; // When batch status was last updated

    @Column
    private Long lastStatusChangedBy; // User ID who made the last status change

    // DEPRECATED: Use currentOwnerId/currentOwnerRole instead
    @Deprecated
    @Column
    @Enumerated(EnumType.STRING)
    private SupplyChainStage currentSupplyChainStage;

    @Deprecated
    @Column
    private LocalDateTime supplyChainStartedAt;

    @Deprecated
    @Column
    private LocalDateTime supplyChainCompletedAt;

    @Deprecated
    @Column
    private Integer totalHandlers; // Number of actors in supply chain

    @Deprecated
    @Column
    private String currentHandlerRole; // DEPRECATED: Use currentOwnerRole

    @Deprecated
    @Column
    private Long currentHandlerId; // DEPRECATED: Use currentOwnerId

    // Metadata
    @Column
    private LocalDate sowingDate;

    @Column
    private LocalDate harvestDate;

    @Column
    private String qrCodeUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String cropImageUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Simplified 12-state unified batch status system with auto-accept model
     * Flow: CREATED -> HARVESTED -> RECEIVED_BY_DIST -> QUALITY_PASSED -> RECEIVED_BY_RETAIL -> AVAILABLE -> DELIVERED -> CONSUMED | EXPIRED | DISCARDED
     *
     * State Meanings:
     * CREATED              - Batch created by farmer, not yet harvested
     * HARVESTED            - Batch harvested and ready for transfer to distributor
     * REJECTED_BY_FARMER   - Batch rejected during farmer's quality check
     * RECEIVED_BY_DIST     - Auto-received by distributor when transfer accepted (no PENDING/IN_TRANSIT)
     * QUALITY_PASSED       - Distributor's quality check completed successfully
     * REJECTED_BY_DIST     - Distributor rejected batch
     * RECEIVED_BY_RETAIL   - Auto-received by retailer when transfer from distributor accepted
     * AVAILABLE            - Batch available in retail store for sale
     * LOW_STOCK            - Retailer inventory low stock warning
     * REJECTED_BY_RETAIL   - Retailer rejected batch
     * DELIVERED            - Auto-transitioned to consumer when sale completed
     * CONSUMED             - Consumer received and consumed product
     * EXPIRED              - Batch shelf life exceeded
     * DISCARDED            - Batch discarded due to damage or other reasons
     */
    public enum BatchStatus {
        // Farmer stage
        CREATED,                // Batch created, not harvested
        HARVESTED,              // Ready for transfer to distributor

        // Farmer rejection
        REJECTED_BY_FARMER,     // Farmer quality check failed

        // Distributor stage (auto-accept on transfer)
        RECEIVED_BY_DIST,       // Auto-received when distributor accepts transfer
        QUALITY_PASSED,         // Distributor quality check passed
        REJECTED_BY_DIST,       // Distributor quality check failed

        // Retailer stage (auto-accept on transfer)
        RECEIVED_BY_RETAIL,     // Auto-received when retailer accepts transfer
        AVAILABLE,              // Available for sale
        LOW_STOCK,              // Low stock threshold reached
        REJECTED_BY_RETAIL,     // Retailer rejected batch

        // Consumer/End stage (auto-accept on sale)
        DELIVERED,              // Auto-delivered to consumer on sale completion

        // Terminal states
        CONSUMED,               // Consumer received and consumed
        EXPIRED,                // Exceeded shelf life
        DISCARDED               // Discarded/damaged
    }

    public enum QuantityUnit {
        kg, ton, quintal
    }

    @Deprecated(forRemoval = true, since = "2.0")
    public enum SupplyChainStage {
        CREATED,        // Batch created by farmer
        IN_TRANSIT,     // In transit to distributor
        RECEIVED,       // Received by distributor/retailer
        QUALITY_CHECK,  // Quality inspection
        STORED,         // Stored in warehouse
        SOLD,           // Sold to end customer
        REJECTED,       // Rejected
        EXPIRED         // Expired
    }
}


