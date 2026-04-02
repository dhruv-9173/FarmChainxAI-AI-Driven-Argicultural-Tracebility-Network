package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "retailer_profiles", indexes = {
        @Index(name = "idx_retailer_id", columnList = "retailer_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerProfile {

    @Id
    @Column(name = "retailer_id")
    private Long retailerId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "retailer_id", referencedColumnName = "id")
    private User user;

    @Column(length = 255)
    private String storeLocation;

    @Column(length = 100)
    private String storeCity;

    @Column(length = 100)
    private String storeState;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (retailerId == null && user != null) {
            retailerId = user.getId();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
