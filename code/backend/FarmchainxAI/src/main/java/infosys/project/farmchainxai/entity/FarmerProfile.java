package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmer_profiles", indexes = {
        @Index(name = "idx_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_farm_id", columnList = "farm_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerProfile {

    @Id
    @Column(name = "farmer_id")
    private Long farmerId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "farmer_id", referencedColumnName = "id")
    private User user;

    @Column(name = "farm_id", length = 255)
    private String farmId;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean verified = false;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(length = 500)
    private String profileImageUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String profileImageBase64;

    @OneToOne(mappedBy = "farmerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private FarmDetails farmDetails;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (farmerId == null && user != null) {
            farmerId = user.getId();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
