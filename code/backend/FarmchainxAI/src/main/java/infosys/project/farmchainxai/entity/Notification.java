package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_is_read", columnList = "is_read")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @Column(nullable = false)
    private Long userId;

    @Column
    private String type; // BATCH_TRANSFER, BATCH_REJECTED, etc

    @Column
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column
    private String relatedBatchId;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean isRead = false;

    @Column
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}


