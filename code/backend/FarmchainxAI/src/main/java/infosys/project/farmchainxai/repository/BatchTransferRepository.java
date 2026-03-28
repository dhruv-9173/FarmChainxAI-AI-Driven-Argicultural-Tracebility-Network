package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.BatchTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchTransferRepository extends JpaRepository<BatchTransfer, String> {
    List<BatchTransfer> findByBatchId(String batchId);
    List<BatchTransfer> findByRecipientId(Long recipientId);
    List<BatchTransfer> findBySenderId(Long senderId);
    Optional<BatchTransfer> findTopByBatchIdOrderByCreatedAtDesc(String batchId);
    List<BatchTransfer> findByRecipientIdAndTransferStatus(Long recipientId, BatchTransfer.TransferStatus status);
    List<BatchTransfer> findByBatchIdAndRecipientId(String batchId, Long recipientId);
}


