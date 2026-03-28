package infosys.project.farmchainxai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "batch_transfers", indexes = {
        @Index(name = "idx_batch_id", columnList = "batch_id"),
        @Index(name = "idx_recipient_id", columnList = "recipient_id"),
        @Index(name = "idx_status", columnList = "transfer_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchTransfer {

    @Id
    private String id;

    @Column(nullable = false)
    private String batchId;

    @Column(nullable = false)
    private Long senderId;

    @Column
    private String senderRole;

    @Column(nullable = false)
    private Long recipientId;

    @Column
    private String recipientRole;

    @Column
    @Enumerated(EnumType.STRING)
    @Default
    private TransferStatus transferStatus = TransferStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String inspectionNote;

    @Column(precision = 15, scale = 2)
    private BigDecimal transferredQuantity;

    @Column
    private LocalDateTime transferredAt;

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

    public enum TransferStatus {
        PENDING, ACCEPTED, REJECTED, CANCELLED
    }
}


