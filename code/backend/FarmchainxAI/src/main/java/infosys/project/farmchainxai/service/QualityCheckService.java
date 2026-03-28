package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * QualityCheckService
 * Manages quality inspection workflow for batches
 * Used by distributors and retailers for QC before accepting batches
 */
@Service
@Slf4j
public class QualityCheckService {

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SupplyChainService supplyChainService;

    /**
     * Initiate quality check for a batch
     */
    @Transactional
    public QualityCheckDto initiateQualityCheck(String email, String batchId, InitiateQCRequest request) {
        Long userId = getUserIdFromEmail(email);
        User inspector = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        // ✅ Guard: batch must be awaiting QC (not already processed)
        if (batch.getStatus() != Batch.BatchStatus.RECEIVED_BY_DIST &&
            batch.getStatus() != Batch.BatchStatus.RECEIVED_BY_RETAIL) {
            throw new RuntimeException("Cannot initiate QC. Batch is not awaiting inspection. Current status: " + batch.getStatus());
        }

        // Validate user can perform QC
        validateQCPermission(inspector.getRole(), batch);

        // Create quality check record
        QualityCheckDto qc = QualityCheckDto.builder()
                .id(UUID.randomUUID().toString())
                .batchId(batchId)
                .inspectorId(userId)
                .inspectorName(inspector.getFullName())
                .inspectionDate(LocalDateTime.now())
                .status("IN_PROGRESS")
                .moistureLevel(request.getMoistureLevel())
                .temperature(request.getTemperature())
                .phLevel(request.getPhLevel())
                .color(request.getColor())
                .texture(request.getTexture())
                .smell(request.getSmell())
                .pestInfestation(request.getPestInfestation())
                .moldPresence(request.getMoldPresence())
                .foreignMatter(request.getForeignMatter())
                .notes(request.getNotes())
                .build();

        // Keep batch in RECEIVED_BY_DIST/RECEIVED_BY_RETAIL status during QC
        // Status will transition to QUALITY_PASSED or REJECTED_BY_* after QC completion
        batchRepository.save(batch);

        createActivity(userId, inspector.getRole().name(), "QC_INITIATED",
                "Quality Check Initiated", "Quality inspection started for batch: " + batchId, batchId);

        log.info("✅ Quality check initiated for batch: {} by user: {}", batchId, email);
        return qc;
    }

    /**
     * Complete quality check and approve batch
     */
    @Transactional
    public QualityCheckDto approveQualityCheck(String email, String batchId, ApproveQCRequest request) {
        Long userId = getUserIdFromEmail(email);
        User inspector = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (batch.getStatus() != Batch.BatchStatus.RECEIVED_BY_DIST && 
            batch.getStatus() != Batch.BatchStatus.RECEIVED_BY_RETAIL) {
            throw new RuntimeException("Cannot approve QC. Batch status: " + batch.getStatus());
        }

        // Calculate quality score
        Integer qualityScore = calculateQualityScore(request);
        batch.setQualityScore(qualityScore);
        String recipientRole = batch.getCurrentOwnerRole();

        if (qualityScore >= 70) {
            batch.setStatus(Batch.BatchStatus.QUALITY_PASSED);
            log.info("✅ Batch {} approved with quality score: {}", batchId, qualityScore);
            
            try {
                SupplyChainEvent qcEvent = new SupplyChainEvent();
                qcEvent.setBatchId(batchId);
                qcEvent.setStage(SupplyChainEvent.SupplyChainStage.QUALITY_CHECK);
                qcEvent.setActorId(userId);
                qcEvent.setActorName(inspector.getFullName());
                qcEvent.setActorRole(inspector.getRole().name());
                qcEvent.setLocation("Inspector Location");
                qcEvent.setTimestamp(LocalDateTime.now());
                qcEvent.setNotes("Quality check passed with score: " + qualityScore + ". " + request.getFinalNotes());
                supplyChainService.logSupplyChainEvent(qcEvent);
                log.info("✅ QC supply chain event created for approved batch: {}", batchId);
            } catch (Exception e) {
                log.warn("⚠️ Warning: Failed to log QC supply chain event: {}", e.getMessage());
            }
        } else {
            batch.setStatus("DISTRIBUTOR".equals(recipientRole) ? 
                    Batch.BatchStatus.REJECTED_BY_DIST : 
                    Batch.BatchStatus.REJECTED_BY_RETAIL);
            log.warn("⚠️ Batch {} rejected with low quality score: {}", batchId, qualityScore);
            
            try {
                SupplyChainEvent qcEvent = new SupplyChainEvent();
                qcEvent.setBatchId(batchId);
                qcEvent.setStage(SupplyChainEvent.SupplyChainStage.REJECTED);
                qcEvent.setActorId(userId);
                qcEvent.setActorName(inspector.getFullName());
                qcEvent.setActorRole(inspector.getRole().name());
                qcEvent.setLocation("Inspector Location");
                qcEvent.setTimestamp(LocalDateTime.now());
                qcEvent.setNotes("Quality check failed with score: " + qualityScore + ". " + request.getFinalNotes());
                supplyChainService.logSupplyChainEvent(qcEvent);
                log.info("✅ QC supply chain event created for rejected batch: {}", batchId);
            } catch (Exception e) {
                log.warn("⚠️ Warning: Failed to log rejected QC supply chain event: {}", e.getMessage());
            }
        }

        batchRepository.save(batch);

        QualityCheckDto result = QualityCheckDto.builder()
                .id(UUID.randomUUID().toString())
                .batchId(batchId)
                .inspectorId(userId)
                .inspectorName(inspector.getFullName())
                .inspectionDate(LocalDateTime.now())
                .status(qualityScore >= 70 ? "APPROVED" : "REJECTED")
                .qualityScore(qualityScore)
                .certificateNumber("QC-" + System.currentTimeMillis())
                .notes(request.getFinalNotes())
                .build();

        // Notify farmer/distributor
        notifyQCResult(batch, qualityScore, inspector);

        createActivity(userId, inspector.getRole().name(), 
                qualityScore >= 70 ? "QC_APPROVED" : "QC_REJECTED",
                qualityScore >= 70 ? "QC Approved" : "QC Rejected",
                "Quality score: " + qualityScore + ". " + request.getFinalNotes(), batchId);

        return result;
    }

    /**
     * Reject batch after QC failure
     */
    @Transactional
    public void rejectAfterQC(String email, String batchId, RejectQCRequest request) {
        Long userId = getUserIdFromEmail(email);
        User inspector = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        String recipientRole = batch.getCurrentOwnerRole();
        batch.setStatus("DISTRIBUTOR".equals(recipientRole) ? 
                Batch.BatchStatus.REJECTED_BY_DIST : 
                Batch.BatchStatus.REJECTED_BY_RETAIL);
        batch.setQualityScore(request.getQualityScore());
        batchRepository.save(batch);

        try {
            SupplyChainEvent qcEvent = new SupplyChainEvent();
            qcEvent.setBatchId(batchId);
            qcEvent.setStage(SupplyChainEvent.SupplyChainStage.REJECTED);
            qcEvent.setActorId(userId);
            qcEvent.setActorName(inspector.getFullName());
            qcEvent.setActorRole(inspector.getRole().name());
            qcEvent.setLocation("Inspector Location");
            qcEvent.setTimestamp(LocalDateTime.now());
            qcEvent.setNotes("Batch rejected in QC. Reason: " + request.getRejectionReason());
            supplyChainService.logSupplyChainEvent(qcEvent);
            log.info("✅ QC supply chain event created for rejected batch: {}", batchId);
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to log rejected QC supply chain event: {}", e.getMessage());
        }

        // Notify previous actor
        notifyRejection(batch, inspector, request.getRejectionReason());

        createActivity(userId, inspector.getRole().name(), "QC_REJECTED",
                "QC Rejected", "Reason: " + request.getRejectionReason(), batchId);

        log.info("✅ Batch {} rejected with reason: {}", batchId, request.getRejectionReason());
    }

    /**
     * Get QC status for a batch
     */
    public QualityCheckDto getQCStatus(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        return QualityCheckDto.builder()
                .batchId(batchId)
                .status(batch.getStatus().name())
                .qualityScore(batch.getQualityScore())
                .build();
    }

    /**
     * Get pending QC items for a user (distributor/retailer)
     */
    public List<QualityCheckDto> getPendingQCItems(String email) {
        Long userId = getUserIdFromEmail(email);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Batch> pendingQC;

        if (user.getRole() == User.UserRole.DISTRIBUTOR) {
            pendingQC = batchRepository.findByDistributorId(userId).stream()
                    .filter(b -> b.getStatus() == Batch.BatchStatus.RECEIVED_BY_DIST)
                    .collect(Collectors.toList());
        } else if (user.getRole() == User.UserRole.RETAILER) {
            // Retailer's received batches needing QC
            pendingQC = batchRepository.findByRetailerId(userId).stream()
                    .filter(b -> b.getStatus() == Batch.BatchStatus.RECEIVED_BY_RETAIL)
                    .collect(Collectors.toList());
        } else {
            pendingQC = Collections.emptyList();
        }

        return pendingQC.stream()
                .map(b -> QualityCheckDto.builder()
                        .batchId(b.getId())
                        .status(b.getStatus().name())
                        .cropType(b.getCropType())
                        .quantity(b.getQuantity() != null ? b.getQuantity().doubleValue() : 0.0)
                        .qualityScore(b.getQualityScore())
                        .build())
                .collect(Collectors.toList());
    }

    // ========== HELPER METHODS ==========

    private Integer calculateQualityScore(ApproveQCRequest request) {
        int score = 100;

        // Color check (10 points)
        if (!request.getColor().equalsIgnoreCase("GOOD")) {
            score -= request.getColor().equalsIgnoreCase("FAIR") ? 5 : 10;
        }

        // Texture check (10 points)
        if (!request.getTexture().equalsIgnoreCase("GOOD")) {
            score -= request.getTexture().equalsIgnoreCase("FAIR") ? 5 : 10;
        }

        // Smell check (10 points)
        if (request.getSmell() != null && !request.getSmell().equalsIgnoreCase("NORMAL")) {
            score -= 15;
        }

        // Pest infestation (20 points)
        if (Boolean.TRUE.equals(request.getPestInfestation())) {
            score -= 20;
        }

        // Mold presence (20 points)
        if (Boolean.TRUE.equals(request.getMoldPresence())) {
            score -= 20;
        }

        // Foreign matter (15 points)
        if (Boolean.TRUE.equals(request.getForeignMatter())) {
            score -= 15;
        }

        return Math.max(0, Math.min(100, score));
    }

    private void validateQCPermission(User.UserRole role, Batch batch) {
        if (role != User.UserRole.DISTRIBUTOR && role != User.UserRole.RETAILER) {
            throw new RuntimeException("Only distributors and retailers can perform quality checks");
        }
    }

    private void notifyQCResult(Batch batch, Integer qualityScore, User inspector) {
        String message = qualityScore >= 70 
                ? "Batch passed quality check with score: " + qualityScore
                : "Batch rejected in quality check with score: " + qualityScore;

        if (batch.getFarmerId() != null) {
            notificationService.createNotification(batch.getFarmerId(),
                new CreateNotificationRequest("QC_RESULT", "Quality Check Result", message, batch.getId()));
        }
    }

    private void notifyRejection(Batch batch, User inspector, String reason) {
        String message = "Your batch was rejected during quality inspection. Reason: " + reason;

        if (batch.getFarmerId() != null) {
            notificationService.createNotification(batch.getFarmerId(),
                new CreateNotificationRequest("BATCH_QC_REJECTED", "Batch Rejected in QC", 
                    message, batch.getId()));
        }
    }

    private Long getUserIdFromEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private void createActivity(Long userId, String userRole, String actionType,
                               String title, String description, String batchId) {
        Activity activity = Activity.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .userRole(userRole)
                .actionType(actionType)
                .title(title)
                .description(description)
                .batchId(batchId)
                .build();
        activityRepository.save(activity);
    }
}
