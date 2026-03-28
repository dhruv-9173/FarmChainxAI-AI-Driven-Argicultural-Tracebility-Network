package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * FarmDetails - Essential farm information
 * Stores technical and operational details about the farm
 * One-to-One relationship with FarmerProfile
 */
@Entity
@Table(name = "farm_details", indexes = {
        @Index(name = "idx_farm_details_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_farm_details_farm_id", columnList = "farm_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmDetails {

    // ============ PRIMARY KEY & RELATIONSHIP ============
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "farmer_id", nullable = false, referencedColumnName = "farmer_id")
    private FarmerProfile farmerProfile;

    @Column(name = "farm_id", nullable = false, length = 255)
    private String farmId;

    // ============ BASIC FARM INFORMATION ============
    @Column(length = 255)
    private String farmName;

    @Column(length = 255)
    private String farmLocation;

    @Column(precision = 10, scale = 2)
    private BigDecimal farmSize;

    @Column(length = 255)
    private String primaryCrops;

    // ============ SOIL & CROP INFORMATION ============
    @Column(length = 100)
    private String soilType;

    // ============ WATER MANAGEMENT ============
    @Column(length = 100)
    private String irrigationType;

    // ============ METADATA ============
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (farmId == null && farmerProfile != null && farmerProfile.getFarmId() != null) {
            farmId = farmerProfile.getFarmId();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
