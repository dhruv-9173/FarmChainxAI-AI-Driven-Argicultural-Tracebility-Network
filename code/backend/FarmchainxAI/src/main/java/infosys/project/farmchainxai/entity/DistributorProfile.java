package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "distributor_profiles", indexes = {
        @Index(name = "idx_distributor_id", columnList = "distributor_id"),
        @Index(name = "idx_company_id", columnList = "company_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributorProfile {

    @Id
    @Column(name = "distributor_id")
    private Long distributorId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "distributor_id", referencedColumnName = "id")
    private User user;

    @Column(length = 255)
    private String companyName;

    @Column(length = 100)
    private String companyId;

    @Column(length = 255)
    private String warehouseLocation;

    @Column(length = 100)
    private String gstNumber;

    @Column(length = 100)
    private String licenseNumber;

    @Column(length = 255)
    private String operationalArea;

    @Column(length = 100)
    private String warehouseCapacity;

    @Column(length = 20)
    private String establishedYear;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(length = 500)
    private String profileImageUrl;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (distributorId == null && user != null) {
            distributorId = user.getId();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
