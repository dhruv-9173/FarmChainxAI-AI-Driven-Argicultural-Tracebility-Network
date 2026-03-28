package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.entity.Batch;
import infosys.project.farmchainxai.entity.SupplyChainEvent;
import infosys.project.farmchainxai.repository.SupplyChainEventRepository;
import infosys.project.farmchainxai.repository.BatchRepository;
import infosys.project.farmchainxai.dto.SupplyChainEventDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SupplyChainService
 * Manages supply chain event logging and verification
 * Integrates blockchain hashing for immutability
 */
@Service
public class SupplyChainService {

    @Autowired
    private SupplyChainEventRepository supplyChainEventRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private BlockchainService blockchainService;

    /**
     * Log a supply chain event with blockchain hashing
     * Creates immutable record of batch movement
     * 
     * @param event Supply chain event to log
     * @return Saved event with hashes and signature
     */
    @Transactional
    public SupplyChainEvent logSupplyChainEvent(SupplyChainEvent event) {
        // Validate event
        if (event.getBatchId() == null || event.getBatchId().isEmpty()) {
            throw new IllegalArgumentException("Batch ID is required");
        }
        
        if (event.getStage() == null) {
            throw new IllegalArgumentException("Supply chain stage is required");
        }
        
        if (event.getActorId() == null) {
            throw new IllegalArgumentException("Actor ID is required");
        }

        // Generate unique event ID if not provided
        if (event.getId() == null || event.getId().isEmpty()) {
            event.setId(java.util.UUID.randomUUID().toString());
        }

        // Get previous event to create chain
        SupplyChainEvent lastEvent = supplyChainEventRepository
            .findFirstByBatchIdOrderByTimestampDesc(event.getBatchId())
            .orElse(null);

        String previousHash = lastEvent != null ? lastEvent.getEventHash() : null;

        // Set timestamp if not provided
        if (event.getTimestamp() == null) {
            event.setTimestamp(LocalDateTime.now());
        }

        // Set default location if not provided
        if (event.getLocation() == null || event.getLocation().isEmpty()) {
            event.setLocation("Unknown Location");
        }

        // Generate cryptographic hash for this event
        String eventHash = blockchainService.generateEventHash(
            event.getBatchId(),
            event.getStage().toString(),
            event.getLocation(),
            event.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli(),
            previousHash
        );

        // Create digital signature by actor
        String signature = blockchainService.signEvent(
            eventHash,
            String.valueOf(event.getActorId())
        );

        // Store on event
        event.setEventHash(eventHash);
        event.setPreviousEventHash(previousHash);
        event.setActorSignature(signature);
        event.setIsVerified(true);
        event.setCreatedAt(LocalDateTime.now());

        // Save to database
        SupplyChainEvent savedEvent = supplyChainEventRepository.save(event);

        // Update batch's current stage
        updateBatchStage(event.getBatchId(), event.getStage());

        return savedEvent;
    }

    /**
     * Get complete supply chain with verification
     * Verifies entire chain integrity before returning
     * 
     * @param batchId Batch identifier
     * @return List of verified events
     * @throws RuntimeException if chain is tampered
     */
    @Transactional(readOnly = true)
    public List<SupplyChainEvent> getSupplyChainWithVerification(String batchId) {
        List<SupplyChainEvent> events = supplyChainEventRepository
            .findByBatchIdOrderByTimestampAsc(batchId);

        if (events.isEmpty()) {
            return events;
        }

        // Verify entire chain - this is the key security feature
        boolean isValid = blockchainService.verifySupplyChain(events);
        
        if (!isValid) {
            throw new RuntimeException(
                "⚠️ ALERT: Supply chain integrity compromised! Possible tampering detected in batch: " + batchId
            );
        }

        return events;
    }

    /**
     * Get supply chain with verification status and additional metadata
     * 
     * @param batchId Batch identifier
     * @return Map containing verification status, events, and chain metrics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSupplyChainStatus(String batchId) {
        try {
            List<SupplyChainEvent> events = getSupplyChainWithVerification(batchId);
            
            // Calculate chain metrics
            String merkleRoot = blockchainService.calculateMerkleRoot(events);
            
            return Map.of(
                "batchId", batchId,
                "isValid", true,
                "eventCount", events.size(),
                "events", events,
                "merkleRoot", merkleRoot,
                "message", "✓ Supply chain verified - authentic record"
            );
        } catch (RuntimeException e) {
            return Map.of(
                "batchId", batchId,
                "isValid", false,
                "eventCount", 0,
                "events", List.of(),
                "message", e.getMessage()
            );
        }
    }

    /**
     * Get hash chain only (lightweight verification)
     * Returns just the hash chain for quick verification
     * 
     * @param batchId Batch identifier
     * @return List of hash chain nodes
     */
    @Transactional(readOnly = true)
    public List<Map<String, String>> getHashChain(String batchId) {
        List<SupplyChainEvent> events = supplyChainEventRepository
            .findByBatchIdOrderByTimestampAsc(batchId);

        return events.stream()
            .map(event -> {
                Map<String, String> map = new HashMap<>();
                map.put("stage", event.getStage().toString());
                map.put("timestamp", event.getTimestamp().toString());
                map.put("location", event.getLocation() != null ? event.getLocation() : "N/A");
                map.put("hash", event.getEventHash());
                map.put("previousHash", event.getPreviousEventHash() != null ? event.getPreviousEventHash() : "GENESIS");
                map.put("actorId", String.valueOf(event.getActorId()));
                map.put("actorRole", event.getActorRole() != null ? event.getActorRole() : "UNKNOWN");
                return map;
            })
            .collect(Collectors.toList());
    }

    /**
     * Get events for a specific batch stage
     * 
     * @param batchId Batch identifier
     * @param stage Supply chain stage
     * @return Events at that stage
     */
    @Transactional(readOnly = true)
    public List<SupplyChainEvent> getEventsByStage(String batchId, SupplyChainEvent.SupplyChainStage stage) {
        return supplyChainEventRepository.findByBatchIdAndStageOrderByTimestampAsc(batchId, stage);
    }

    /**
     * Get all events created by a specific actor
     * 
     * @param actorId User/actor identifier
     * @return All events created by this actor
     */
    @Transactional(readOnly = true)
    public List<SupplyChainEvent> getEventsByActor(Long actorId) {
        return supplyChainEventRepository.findByActorIdOrderByTimestampDesc(actorId);
    }

    /**
     * Get supply chain timeline (events and their metadata)
     * 
     * @param batchId Batch identifier
     * @return DTO with timeline information
     */
    @Transactional(readOnly = true)
    public SupplyChainEventDto getSupplyChainTimeline(String batchId) {
        List<SupplyChainEvent> events = supplyChainEventRepository
            .findByBatchIdOrderByTimestampAsc(batchId);

        if (events.isEmpty()) {
            return null;
        }

        // Build timeline DTO
        SupplyChainEventDto timeline = new SupplyChainEventDto();
        timeline.setBatchId(batchId);
        timeline.setTotalEvents(events.size());
        timeline.setFirstEventTime(events.get(0).getTimestamp());
        timeline.setLastEventTime(events.get(events.size() - 1).getTimestamp());
        timeline.setCurrentStage(events.get(events.size() - 1).getStage().toString());

        return timeline;
    }

    /**
     * Verify a specific event's authenticity
     * 
     * @param eventId Event identifier
     * @return Verification result
     */
    @Transactional(readOnly = true)
    public boolean verifyEvent(String eventId) {
        SupplyChainEvent event = supplyChainEventRepository.findById(eventId).orElse(null);
        
        if (event == null) {
            return false;
        }

        // Verify signature
        return blockchainService.verifySignature(
            event.getEventHash(),
            String.valueOf(event.getActorId()),
            event.getActorSignature()
        );
    }

    /**
     * Get chain completion percentage
     * Based on progression through key supply chain stages
     * 
     * @param batchId Batch identifier
     * @return Percentage of expected journey completed
     */
    @Transactional(readOnly = true)
    public double getChainCompletionPercentage(String batchId) {
        List<SupplyChainEvent> events = supplyChainEventRepository
            .findByBatchIdOrderByTimestampAsc(batchId);

        if (events.isEmpty()) {
            return 0.0;
        }

        // Define key stages in order
        SupplyChainEvent.SupplyChainStage[] keyStages = {
            SupplyChainEvent.SupplyChainStage.CREATED,
            SupplyChainEvent.SupplyChainStage.IN_TRANSIT,
            SupplyChainEvent.SupplyChainStage.RECEIVED,
            SupplyChainEvent.SupplyChainStage.QUALITY_CHECK,
            SupplyChainEvent.SupplyChainStage.STORED,
            SupplyChainEvent.SupplyChainStage.SOLD
        };

        // Get distinct stages in the current chain
        java.util.Set<SupplyChainEvent.SupplyChainStage> eventStages = events.stream()
            .map(SupplyChainEvent::getStage)
            .collect(java.util.stream.Collectors.toSet());

        // Count how many key stages are present
        long completedStages = 0;
        for (SupplyChainEvent.SupplyChainStage keyStage : keyStages) {
            if (eventStages.contains(keyStage)) {
                completedStages++;
            }
        }

        return (completedStages / (double) keyStages.length) * 100;
    }

    /**
     * Get time spent in each stage
     * Calculates duration from first event of stage to last event of stage
     * 
     * @param batchId Batch identifier
     * @return Map of stage to duration in hours
     */
    @Transactional(readOnly = true)
    public Map<String, Double> getTimeInEachStage(String batchId) {
        List<SupplyChainEvent> events = supplyChainEventRepository
            .findByBatchIdOrderByTimestampAsc(batchId);

        if (events.isEmpty()) {
            return new HashMap<>();
        }

        // Group events by stage and calculate duration for each stage
        Map<String, Double> timeMap = new HashMap<>();
        Map<SupplyChainEvent.SupplyChainStage, LocalDateTime> stageFirstTime = new HashMap<>();
        Map<SupplyChainEvent.SupplyChainStage, LocalDateTime> stageLastTime = new HashMap<>();

        // Collect first and last timestamps for each stage
        for (SupplyChainEvent event : events) {
            SupplyChainEvent.SupplyChainStage stage = event.getStage();
            stageFirstTime.putIfAbsent(stage, event.getTimestamp());
            stageLastTime.put(stage, event.getTimestamp());
        }

        // Calculate duration for each stage
        for (SupplyChainEvent.SupplyChainStage stage : stageFirstTime.keySet()) {
            long hours = java.time.temporal.ChronoUnit.HOURS.between(
                stageFirstTime.get(stage),
                stageLastTime.get(stage)
            );
            timeMap.put(stage.toString(), (double) hours);
        }

        return timeMap;
    }

    /**
     * Update batch's current supply chain stage
     */
    private void updateBatchStage(String batchId, SupplyChainEvent.SupplyChainStage stage) {
        Batch batch = batchRepository.findById(batchId).orElse(null);
        if (batch != null) {
            // Map supply chain stage to batch status
            Batch.BatchStatus batchStatus = mapStageToBatchStatus(stage);
            batch.setStatus(batchStatus);
            batchRepository.save(batch);
        }
    }

    /**
     * Map supply chain stage to batch status
     */
    private Batch.BatchStatus mapStageToBatchStatus(SupplyChainEvent.SupplyChainStage stage) {
        return switch (stage) {
            case CREATED -> Batch.BatchStatus.CREATED;
            case IN_TRANSIT -> Batch.BatchStatus.HARVESTED;
            case RECEIVED -> Batch.BatchStatus.RECEIVED_BY_DIST;
            case QUALITY_CHECK -> Batch.BatchStatus.QUALITY_PASSED;
            case STORED -> Batch.BatchStatus.AVAILABLE;
            case SOLD -> Batch.BatchStatus.DELIVERED;
            case REJECTED -> Batch.BatchStatus.REJECTED_BY_DIST;
            case EXPIRED -> Batch.BatchStatus.EXPIRED;
        };
    }
}
