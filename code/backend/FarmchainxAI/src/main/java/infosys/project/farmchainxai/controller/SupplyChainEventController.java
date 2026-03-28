package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.entity.SupplyChainEvent;
import infosys.project.farmchainxai.service.SupplyChainService;
import infosys.project.farmchainxai.dto.SupplyChainEventDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SupplyChainEventController
 * REST API for supply chain tracking with blockchain verification
 * All endpoints provide immutable, verifiable supply chain history
 */
@RestController
@RequestMapping("/api/v1/supply-chain")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SupplyChainEventController {

    private static final Logger logger = LoggerFactory.getLogger(SupplyChainEventController.class);

    @Autowired
    private SupplyChainService supplyChainService;

    /**
     * Log a new supply chain event
     * POST /api/v1/supply-chain/event
     * @param event Event data (validated, all required fields must be present)
     * @return Created event with blockchain hash verification
     */
    @PostMapping("/event")
    public ResponseEntity<Map<String, Object>> logSupplyChainEvent(
            @Valid @RequestBody SupplyChainEvent event) {
        try {
            // Validate input
            if (event.getBatchId() == null || event.getBatchId().isEmpty()) {
                logger.warn("Invalid supply chain event: missing batchId");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            if (event.getStage() == null) {
                logger.warn("Invalid supply chain event: missing stage for batch {}", event.getBatchId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Supply chain stage is required"
                ));
            }
            
            if (event.getActorId() == null) {
                logger.warn("Invalid supply chain event: missing actorId for batch {}", event.getBatchId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Actor ID is required"
                ));
            }
            
            SupplyChainEvent savedEvent = supplyChainService.logSupplyChainEvent(event);
            logger.info("✅ Supply chain event created: eventId={}, batchId={}, stage={}", 
                savedEvent.getId(), savedEvent.getBatchId(), savedEvent.getStage());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "success",
                "message", "Supply chain event logged with blockchain verification",
                "eventId", savedEvent.getId(),
                "eventHash", savedEvent.getEventHash(),
                "timestamp", savedEvent.getTimestamp().toString()
            ));
        } catch (Exception e) {
            logger.error("❌ Error logging supply chain event", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to log event: " + e.getMessage()
            ));
        }
    }

    /**
     * Get complete supply chain history for a batch with verification
     * GET /api/v1/supply-chain/batch/{batchId}/history
     * @param batchId Batch identifier
     * @return Verified supply chain events
     */
    @GetMapping("/batch/{batchId}/history")
    public ResponseEntity<Map<String, Object>> getBatchHistory(
            @PathVariable String batchId) {
        try {
            if (batchId == null || batchId.isEmpty()) {
                logger.warn("Invalid batchId: empty or null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            List<SupplyChainEvent> events = supplyChainService.getSupplyChainWithVerification(batchId);
            logger.info("✅ Fetched verified supply chain for batch: {}, eventCount={}", batchId, events.size());
            
            List<Map<String, Object>> eventsList = events.stream()
                .map(this::eventToMap)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "batchId", batchId,
                "eventCount", events.size(),
                "events", eventsList,
                "verified", true
            ));
        } catch (RuntimeException e) {
            logger.error("❌ Verification failed for batch: " + batchId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", "error",
                "message", "Chain verification failed: " + e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("❌ Error fetching batch history", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error fetching history: " + e.getMessage()
            ));
        }
    }

    /**
     * Get supply chain with verification status and blockchain metrics
     * GET /api/v1/supply-chain/batch/{batchId}/verified
     * @param batchId Batch identifier
     * @return Verification status and metrics
     */
    @GetMapping("/batch/{batchId}/verified")
    public ResponseEntity<Map<String, Object>> getVerifiedSupplyChain(
            @PathVariable String batchId) {
        try {
            if (batchId == null || batchId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            Map<String, Object> result = supplyChainService.getSupplyChainStatus(batchId);
            logger.info("✅ Verification status retrieved for batch: {}", batchId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("❌ Error verifying supply chain for batch: " + batchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error verifying supply chain: " + e.getMessage()
            ));
        }
    }

    /**
     * Get hash chain only (lightweight verification)
     * Quick way to verify entire supply chain
     * GET /api/v1/supply-chain/batch/{batchId}/hash-chain
     * @param batchId Batch identifier
     * @return Hash chain for cryptographic verification
     */
    @GetMapping("/batch/{batchId}/hash-chain")
    public ResponseEntity<Map<String, Object>> getHashChain(
            @PathVariable String batchId) {
        try {
            if (batchId == null || batchId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            List<Map<String, String>> hashChain = supplyChainService.getHashChain(batchId);
            logger.info("✅ Hash chain retrieved for batch: {}, chainLength={}", batchId, hashChain.size());

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "batchId", batchId,
                "chainLength", hashChain.size(),
                "hashChain", hashChain
            ));
        } catch (Exception e) {
            logger.error("❌ Error retrieving hash chain for batch: " + batchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error retrieving hash chain: " + e.getMessage()
            ));
        }
    }

    /**
     * Get supply chain timeline (summary)
     * GET /api/v1/supply-chain/batch/{batchId}/timeline
     * @param batchId Batch identifier
     * @return Timeline with first/last event times and current stage
     */
    @GetMapping("/batch/{batchId}/timeline")
    public ResponseEntity<Map<String, Object>> getTimeline(
            @PathVariable String batchId) {
        try {
            if (batchId == null || batchId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            SupplyChainEventDto timeline = supplyChainService.getSupplyChainTimeline(batchId);
            
            if (timeline == null) {
                logger.warn("No events found for batch: {}", batchId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", "error",
                    "message", "No events found for batch: " + batchId
                ));
            }

            logger.info("✅ Timeline retrieved for batch: {}", batchId);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "timeline", timeline
            ));
        } catch (Exception e) {
            logger.error("❌ Error retrieving timeline for batch: " + batchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error retrieving timeline: " + e.getMessage()
            ));
        }
    }

    /**
     * Get events by stage
     * GET /api/v1/supply-chain/batch/{batchId}/stage/{stage}
     * @param batchId Batch identifier
     * @param stage Supply chain stage (CREATED, IN_TRANSIT, RECEIVED, etc.)
     * @return Events at specified stage
     */
    @GetMapping("/batch/{batchId}/stage/{stage}")
    public ResponseEntity<Map<String, Object>> getEventsByStage(
            @PathVariable String batchId,
            @PathVariable String stage) {
        try {
            if (batchId == null || batchId.isEmpty() || stage == null || stage.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID and stage are required"
                ));
            }
            
            SupplyChainEvent.SupplyChainStage supplyStage = SupplyChainEvent.SupplyChainStage.valueOf(stage.toUpperCase());
            List<SupplyChainEvent> events = supplyChainService.getEventsByStage(batchId, supplyStage);

            List<Map<String, Object>> eventsList = events.stream()
                .map(this::eventToMap)
                .collect(Collectors.toList());

            logger.info("✅ Events retrieved for batch: {}, stage: {}, count: {}", batchId, stage, events.size());
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "batchId", batchId,
                "stage", stage,
                "count", events.size(),
                "events", eventsList
            ));
        } catch (IllegalArgumentException e) {
            logger.warn("❌ Invalid stage provided: {}", stage);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", "error",
                "message", "Invalid stage: " + stage + ". Must be one of: CREATED, IN_TRANSIT, RECEIVED, QUALITY_CHECK, STORED, SOLD, REJECTED, EXPIRED"
            ));
        } catch (Exception e) {
            logger.error("❌ Error retrieving events by stage", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error retrieving events: " + e.getMessage()
            ));
        }
    }

    /**
     * Get events by actor
     * GET /api/v1/supply-chain/actor/{actorId}/events
     * @param actorId Actor/user identifier
     * @return All events created by this actor
     */
    @GetMapping("/actor/{actorId}/events")
    public ResponseEntity<Map<String, Object>> getEventsByActor(
            @PathVariable Long actorId) {
        try {
            if (actorId == null || actorId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Valid actor ID is required"
                ));
            }
            
            List<SupplyChainEvent> events = supplyChainService.getEventsByActor(actorId);

            List<Map<String, Object>> eventsList = events.stream()
                .map(this::eventToMap)
                .collect(Collectors.toList());

            logger.info("✅ Events retrieved for actor: {}, count: {}", actorId, events.size());
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "actorId", actorId,
                "count", events.size(),
                "events", eventsList
            ));
        } catch (Exception e) {
            logger.error("❌ Error retrieving events for actor: " + actorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error retrieving events: " + e.getMessage()
            ));
        }
    }

    /**
     * Verify a specific event's authenticity
     * GET /api/v1/supply-chain/event/{eventId}/verify
     * @param eventId Event identifier
     * @return Verification result
     */
    @GetMapping("/event/{eventId}/verify")
    public ResponseEntity<Map<String, Object>> verifyEvent(
            @PathVariable String eventId) {
        try {
            if (eventId == null || eventId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Event ID is required"
                ));
            }
            
            boolean isValid = supplyChainService.verifyEvent(eventId);
            logger.info("✅ Event verification completed: eventId={}, isValid={}", eventId, isValid);

            return ResponseEntity.ok(Map.of(
                "eventId", eventId,
                "isValid", isValid,
                "message", isValid ? "✅ Event signature verified" : "❌ Event signature invalid"
            ));
        } catch (Exception e) {
            logger.error("❌ Error verifying event: " + eventId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error verifying event: " + e.getMessage()
            ));
        }
    }

    /**
     * Get supply chain completion percentage
     * GET /api/v1/supply-chain/batch/{batchId}/completion
     * @param batchId Batch identifier
     * @return Completion percentage and status
     */
    @GetMapping("/batch/{batchId}/completion")
    public ResponseEntity<Map<String, Object>> getCompletion(
            @PathVariable String batchId) {
        try {
            if (batchId == null || batchId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            double percentage = supplyChainService.getChainCompletionPercentage(batchId);
            logger.info("✅ Completion status retrieved for batch: {}, percentage: {}%", batchId, String.format("%.2f", percentage));

            return ResponseEntity.ok(Map.of(
                "batchId", batchId,
                "completionPercentage", String.format("%.2f", percentage),
                "status", percentage >= 100 ? "COMPLETE" : "IN_PROGRESS"
            ));
        } catch (Exception e) {
            logger.error("❌ Error calculating completion for batch: " + batchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error calculating completion: " + e.getMessage()
            ));
        }
    }

    /**
     * Get time spent in each stage
     * GET /api/v1/supply-chain/batch/{batchId}/time-analysis
     * @param batchId Batch identifier
     * @return Duration in each stage (hours)
     */
    @GetMapping("/batch/{batchId}/time-analysis")
    public ResponseEntity<Map<String, Object>> getTimeAnalysis(
            @PathVariable String batchId) {
        try {
            if (batchId == null || batchId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            Map<String, Double> timeInStages = supplyChainService.getTimeInEachStage(batchId);
            logger.info("✅ Time analysis retrieved for batch: {}, stageCount: {}", batchId, timeInStages.size());

            return ResponseEntity.ok(Map.of(
                "batchId", batchId,
                "timeInStages", timeInStages,
                "unit", "hours"
            ));
        } catch (Exception e) {
            logger.error("❌ Error calculating time analysis for batch: " + batchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error calculating time analysis: " + e.getMessage()
            ));
        }
    }

    /**
     * Public tracking endpoint (QR code accessible)
     * GET /api/v1/supply-chain/public/track/{batchId}
     * This endpoint is accessible without authentication for public visibility
     * @param batchId Batch identifier
     * @return Public supply chain journey
     */
    @GetMapping("/public/track/{batchId}")
    public ResponseEntity<Map<String, Object>> publicTrack(
            @PathVariable String batchId) {
        try {
            if (batchId == null || batchId.isEmpty()) {
                logger.warn("Public track request with empty batchId");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Batch ID is required"
                ));
            }
            
            List<SupplyChainEvent> events = supplyChainService.getSupplyChainWithVerification(batchId);
            
            List<Map<String, Object>> eventsList = events.stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("stage", e.getStage().toString());
                    map.put("timestamp", e.getTimestamp().toString());
                    map.put("location", e.getLocation() != null ? e.getLocation() : "N/A");
                    if (e.getActorName() != null) map.put("actorName", e.getActorName());
                    if (e.getActorRole() != null) map.put("actorRole", e.getActorRole());
                    if (e.getQualityScore() != null) map.put("qualityScore", e.getQualityScore());
                    return map;
                })
                .collect(Collectors.toList());

            logger.info("✅ Public QR tracking accessed: batchId={}, eventCount={}", batchId, events.size());
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "batchId", batchId,
                "verified", true,
                "journey", eventsList
            ));
        } catch (RuntimeException e) {
            logger.warn("❌ Verification failed in public tracking for batch: " + batchId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", "error",
                "message", "Batch not found or verification failed: " + e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("❌ Error in public tracking for batch: " + batchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Error retrieving batch journey: " + e.getMessage()
            ));
        }
    }

    /**
     * Helper method to convert event to map (excludes null values)
     */
    private Map<String, Object> eventToMap(SupplyChainEvent event) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", event.getId());
        map.put("stage", event.getStage().toString());
        map.put("timestamp", event.getTimestamp().toString());
        if (event.getLocation() != null) map.put("location", event.getLocation());
        if (event.getLatitude() != null) map.put("latitude", event.getLatitude());
        if (event.getLongitude() != null) map.put("longitude", event.getLongitude());
        if (event.getTemperatureC() != null) map.put("temperatureC", event.getTemperatureC());
        if (event.getHumidityPercent() != null) map.put("humidityPercent", event.getHumidityPercent());
        if (event.getQualityScore() != null) map.put("qualityScore", event.getQualityScore());
        if (event.getNotes() != null) map.put("notes", event.getNotes());
        if (event.getEventType() != null) map.put("eventType", event.getEventType());
        map.put("actorId", event.getActorId());
        if (event.getActorName() != null) map.put("actorName", event.getActorName());
        if (event.getActorRole() != null) map.put("actorRole", event.getActorRole());
        map.put("eventHash", event.getEventHash());
        if (event.getPreviousEventHash() != null) map.put("previousEventHash", event.getPreviousEventHash());
        map.put("isVerified", event.getIsVerified());
        return map;
    }
}
