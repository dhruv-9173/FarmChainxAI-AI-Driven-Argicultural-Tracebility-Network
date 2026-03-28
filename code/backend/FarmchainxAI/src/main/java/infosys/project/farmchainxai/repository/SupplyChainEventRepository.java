package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.SupplyChainEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplyChainEventRepository extends JpaRepository<SupplyChainEvent, String> {
    
    /**
     * Get all events for a batch in chronological order
     */
    List<SupplyChainEvent> findByBatchIdOrderByTimestampAsc(String batchId);
    
    /**
     * Get the latest event for a batch
     */
    Optional<SupplyChainEvent> findFirstByBatchIdOrderByTimestampDesc(String batchId);
    
    /**
     * Get events for a batch at a specific stage
     */
    List<SupplyChainEvent> findByBatchIdAndStageOrderByTimestampAsc(
        String batchId, 
        SupplyChainEvent.SupplyChainStage stage
    );
    
    /**
     * Get all events for a specific actor
     */
    List<SupplyChainEvent> findByActorIdOrderByTimestampDesc(Long actorId);
    
    /**
     * Get events by actor and batch
     */
    List<SupplyChainEvent> findByBatchIdAndActorIdOrderByTimestampAsc(String batchId, Long actorId);
    
    /**
     * Get all events created after a specific timestamp
     */
    @Query("SELECT e FROM SupplyChainEvent e WHERE e.batchId = :batchId AND e.timestamp >= :timestamp ORDER BY e.timestamp ASC")
    List<SupplyChainEvent> findEventsSinceTimestamp(String batchId, java.time.LocalDateTime timestamp);
    
    /**
     * Count events for a batch
     */
    long countByBatchId(String batchId);
    
    /**
     * Find events by stage
     */
    List<SupplyChainEvent> findByStageOrderByTimestampDesc(SupplyChainEvent.SupplyChainStage stage);
}
