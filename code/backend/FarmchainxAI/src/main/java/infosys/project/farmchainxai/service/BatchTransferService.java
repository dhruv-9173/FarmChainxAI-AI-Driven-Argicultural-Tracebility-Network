package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.InitiateBatchTransferRequest;
import infosys.project.farmchainxai.dto.TransferRecipientDto;
import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import infosys.project.farmchainxai.util.BatchStatusHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@Slf4j
public class BatchTransferService {

    @Autowired
    private BatchTransferRepository batchTransferRepository;

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
     * Get all users of a specific role with whom the current user has made transfers
     * @param currentUserId The current user's ID
     * @param roleStr The role to filter by (DISTRIBUTOR, RETAILER, FARMER, etc.)
     * @return List of TransferRecipientDto with transfer history
     */
    public List<TransferRecipientDto> getTransferRecipientsByRole(Long currentUserId, String roleStr) {
        try {
            User.UserRole role = User.UserRole.valueOf(roleStr.toUpperCase());

            // Get all batch transfers where current user is sender
            List<BatchTransfer> transfers = batchTransferRepository.findBySenderId(currentUserId);

            // Filter unique recipients by role and collect transfer info
            Map<Long, TransferRecipientDto> recipientMap = new HashMap<>();

            for (BatchTransfer transfer : transfers) {
                User recipient = userRepository.findById(transfer.getRecipientId()).orElse(null);
                
                if (recipient != null && recipient.getRole() == role) {
                    recipientMap.putIfAbsent(recipient.getId(),
                            TransferRecipientDto.builder()
                                    .id(recipient.getId())
                                    .fullName(recipient.getFullName())
                                    .email(recipient.getEmail())
                                    .phone(recipient.getPhone())
                                    .role(recipient.getRole().name())
                                    .transferCount(1L)
                                    .lastTransferDate(transfer.getCreatedAt() != null
                                            ? transfer.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                                            : "")
                                    .build()
                    );

                    // Update transfer count
                    TransferRecipientDto dto = recipientMap.get(recipient.getId());
                    dto.setTransferCount(dto.getTransferCount() + 1);
                    dto.setLastTransferDate(transfer.getCreatedAt() != null
                            ? transfer.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                            : "");
                }
            }

            return new ArrayList<>(recipientMap.values());

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + roleStr);
        }
    }

    /**
     * Search users of a specific role by name or email
     * ✅ OPTIMIZED: Loads transfers once, not per user (fixes N+1 problem)
     * @param currentUserId The current user's ID (to exclude from results)
     * @param roleStr The role to filter by
     * @param searchQuery Search by name or email
     * @return List of matching users
     */
    public List<TransferRecipientDto> searchUsersByRole(Long currentUserId, String roleStr, String searchQuery) {
        try {
            User.UserRole role = User.UserRole.valueOf(roleStr.toUpperCase());
            String query = searchQuery.toLowerCase().trim();

            // ✅ OPTIMIZATION: Load ALL transfers ONCE before processing users
            List<BatchTransfer> allTransfers = batchTransferRepository.findBySenderId(currentUserId);

            // Get all users of the specified role, excluding current user
            List<User> users = userRepository.findByRole(role);

            return users.stream()
                    .filter(u -> !u.getId().equals(currentUserId))  // Exclude current user
                    .filter(u -> 
                            u.getFullName().toLowerCase().contains(query) ||
                            u.getEmail().toLowerCase().contains(query)
                    )
                    .map(u -> {
                        // ✅ FIX: Use pre-loaded transfers, filter only for this user
                        List<BatchTransfer> userTransfers = allTransfers.stream()
                                .filter(t -> t.getRecipientId().equals(u.getId()))
                                .collect(Collectors.toList());

                        // ✅ Count from filtered list (single operation)
                        long transferCount = userTransfers.size();

                        // ✅ Get last transfer date from pre-filtered list
                        String lastTransferDate = userTransfers.stream()
                                .max(Comparator.comparing(BatchTransfer::getCreatedAt))
                                .map(t -> t.getCreatedAt() != null
                                        ? t.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                                        : "")
                                .orElse("");

                        return TransferRecipientDto.builder()
                                .id(u.getId())
                                .fullName(u.getFullName())
                                .email(u.getEmail())
                                .phone(u.getPhone())
                                .role(u.getRole().name())
                                .transferCount(transferCount)
                                .lastTransferDate(lastTransferDate)
                                .build();
                    })
                    .collect(Collectors.toList());

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + roleStr);
        }
    }

    public Map<String, Object> getLatestTransferReceiptForFarmer(Long requesterId, String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + batchId));

        BatchTransfer transfer = batchTransferRepository.findTopByBatchIdOrderByCreatedAtDesc(batchId)
                .orElseThrow(() -> new RuntimeException("No transfer receipt found for this batch"));

        boolean isFarmerOwner = requesterId.equals(batch.getFarmerId());
        boolean isTransferSender = requesterId.equals(transfer.getSenderId());

        if (!isFarmerOwner && !isTransferSender) {
            throw new RuntimeException("Unauthorized: You are not allowed to view this transfer receipt");
        }

        User sender = userRepository.findById(transfer.getSenderId()).orElse(null);
        User recipient = userRepository.findById(transfer.getRecipientId()).orElse(null);

        Map<String, Object> receipt = new HashMap<>();
        receipt.put("transferId", transfer.getId());
        receipt.put("batchId", transfer.getBatchId());
        receipt.put("status", transfer.getTransferStatus().name());
        receipt.put("senderName", sender != null ? sender.getFullName() : "Unknown");
        receipt.put("senderRole", transfer.getSenderRole());
        receipt.put("recipientName", recipient != null ? recipient.getFullName() : "Unknown");
        receipt.put("recipientRole", transfer.getRecipientRole());
        receipt.put("recipientEmail", recipient != null ? recipient.getEmail() : null);
        receipt.put("recipientPhone", recipient != null ? recipient.getPhone() : null);
        receipt.put("cropType", batch.getCropType());
        receipt.put("quantity", batch.getQuantity());
        receipt.put("quantityUnit", batch.getQuantityUnit() != null ? batch.getQuantityUnit().name() : null);
        receipt.put("transferNote", transfer.getInspectionNote());
        receipt.put("createdAt", transfer.getCreatedAt());
        receipt.put("updatedAt", transfer.getUpdatedAt());

        return receipt;
    }

    /**
     * Initiate a batch transfer between two users
     * @param currentUserId The sender's ID (current user)
     * @param request Contains batchId, recipientId, and optional note
     * @return The created BatchTransfer record with status PENDING
     */
    @Transactional
    public BatchTransfer initiateBatchTransfer(Long currentUserId, InitiateBatchTransferRequest request) {
        // Validate batch exists
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found: " + request.getBatchId()));

        // Get sender's role first (needed for validation)
        User sender = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Validate batch belongs to current user (role-aware ownership check)
        if (sender.getRole() == User.UserRole.FARMER) {
            // Farmer: must own via farmerId
            if (!batch.getFarmerId().equals(currentUserId)) {
                throw new RuntimeException("Unauthorized: Batch does not belong to current farmer");
            }
            // Farmer can transfer CREATED or HARVESTED batches
            if (batch.getStatus() != Batch.BatchStatus.HARVESTED && batch.getStatus() != Batch.BatchStatus.CREATED) {
                throw new RuntimeException("Batch cannot be transferred. Current status: " + batch.getStatus() + ". Required: HARVESTED or CREATED");
            }
        } else if (sender.getRole() == User.UserRole.DISTRIBUTOR) {
            // Distributor: must be the current owner.
            // Use currentOwnerId as the source of truth; distributorId is only a legacy fallback.
            if (batch.getCurrentOwnerId() != null) {
                if (!currentUserId.equals(batch.getCurrentOwnerId())) {
                    throw new RuntimeException("Unauthorized: Batch is not currently owned by this distributor");
                }
            } else if (!currentUserId.equals(batch.getDistributorId())) {
                throw new RuntimeException("Unauthorized: Batch is not currently owned by this distributor");
            }
            // Distributor can transfer only quality-checked batches
            if (batch.getStatus() != Batch.BatchStatus.QUALITY_PASSED) {
                throw new RuntimeException("Batch cannot be transferred. Current status: " + batch.getStatus() + ". Required: QUALITY_PASSED");
            }
        } else {
            throw new RuntimeException("Only FARMER or DISTRIBUTOR roles can initiate transfers");
        }

        // Validate recipient exists
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found: " + request.getRecipientId()));

        // Validate recipient role
        if (!recipient.getRole().name().equalsIgnoreCase(request.getRecipientRole())) {
            throw new RuntimeException("Recipient role mismatch");
        }

        // Validate recipient is not the same as sender
        if (currentUserId.equals(request.getRecipientId())) {
            throw new RuntimeException("Cannot transfer batch to yourself");
        }

        // Validate transfer permissions based on sender's role
        validateTransferPermissions(sender.getRole(), recipient.getRole());

        BigDecimal transferUnitPrice = request.getTransferPrice() != null
            ? BigDecimal.valueOf(request.getTransferPrice())
            : null;

        if (transferUnitPrice != null && transferUnitPrice.signum() < 0) {
            throw new RuntimeException("Transfer price cannot be negative");
        }



        // Create batch transfer record
        BatchTransfer transfer = BatchTransfer.builder()
                .id(UUID.randomUUID().toString())
                .batchId(request.getBatchId())
                .senderId(currentUserId)
                .senderRole(sender.getRole().name())
                .recipientId(request.getRecipientId())
                .recipientRole(request.getRecipientRole())
                .transferStatus(BatchTransfer.TransferStatus.PENDING)
                .inspectionNote(request.getNote())
                .transferredQuantity(batch.getQuantity())
                .build();

        BatchTransfer savedTransfer = batchTransferRepository.save(transfer);

        if (transferUnitPrice != null) {
            batch.setPricePerUnit(transferUnitPrice);
            batchRepository.save(batch);
        }

        try {
            SupplyChainEvent transferEvent = new SupplyChainEvent();
            transferEvent.setBatchId(request.getBatchId());
            transferEvent.setStage(SupplyChainEvent.SupplyChainStage.IN_TRANSIT);
            transferEvent.setActorId(currentUserId);
            transferEvent.setActorName(sender.getFullName());
            transferEvent.setActorRole(sender.getRole().name());
            transferEvent.setLocation(sender.getFullName() + " Transfer Point");
            transferEvent.setEventType("TRANSFERRED");
            transferEvent.setTimestamp(LocalDateTime.now());
            if (transferUnitPrice != null) {
                transferEvent.setUnitPrice(transferUnitPrice);
            }
            transferEvent.setNotes("Transfer initiated to " + recipient.getFullName() +
                    (transferUnitPrice != null ? " at unit price INR " + transferUnitPrice : ""));

            supplyChainService.logSupplyChainEvent(transferEvent);
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to create TRANSFERRED supply chain event: {}", e.getMessage());
        }

        // Create activity log for sender
        createActivity(currentUserId, sender.getRole().name(), "BATCH_TRANSFERRED",
                "Batch Transfer Initiated",
                "Initiated transfer of batch " + request.getBatchId() + " to " + recipient.getFullName(),
                request.getBatchId());

        // Create notification for sender
        createNotification(currentUserId, "BATCH_TRANSFER_SENT",
                "Batch Transfer Sent",
                "You have sent batch " + request.getBatchId() + " to " + recipient.getFullName() + ". Auto-accepted immediately.",
                request.getBatchId());

        // ── AUTO-ACCEPT: Immediately accept the transfer on behalf of the recipient ──
        // No manual review needed — batch goes straight to RECEIVED_BY_DIST or RECEIVED_BY_RETAIL
        log.info("✅ AUTO-ACCEPT: Immediately accepting transfer {} for recipient {}", savedTransfer.getId(), request.getRecipientId());
        BatchTransfer acceptedTransfer = acceptTransfer(request.getRecipientId(), savedTransfer.getId(), "Auto-accepted on receipt");

        return acceptedTransfer;
    }

    /**
     * Accept a pending batch transfer
     * ✅ ENHANCED: Auto-assigns status based on recipient role (no PENDING/IN_TRANSIT states)
     *
     * @param currentUserId The recipient's ID (current user)
     * @param transferId The transfer ID to accept
     * @param inspectionNote Optional inspection note from recipient
     * @return The updated BatchTransfer
     */
    @Transactional
    public BatchTransfer acceptTransfer(Long currentUserId, String transferId, String inspectionNote) {
        BatchTransfer transfer = batchTransferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found: " + transferId));

        // Validate current user is the recipient
        if (!transfer.getRecipientId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: You are not the recipient of this transfer");
        }

        // Validate transfer is in PENDING status
        if (transfer.getTransferStatus() != BatchTransfer.TransferStatus.PENDING) {
            throw new RuntimeException("Transfer cannot be accepted. Current status: " + transfer.getTransferStatus());
        }

        // Update transfer status
        transfer.setTransferStatus(BatchTransfer.TransferStatus.ACCEPTED);
        if (inspectionNote != null && !inspectionNote.isEmpty()) {
            transfer.setInspectionNote(inspectionNote);
        }
        transfer.setTransferredAt(LocalDateTime.now());
        BatchTransfer updated = batchTransferRepository.save(transfer);

        // ✅ AUTO-ACCEPT: Set batch status based on recipient role using helper
        Batch batch = batchRepository.findById(transfer.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        
        // Get the auto-accept status for this recipient role
        Batch.BatchStatus autoStatus = BatchStatusHelper.getAutoAcceptStatus(transfer.getRecipientRole());
        batch.setStatus(autoStatus);
        
        // ✅ NEW: Update ownership tracking
        batch.setCurrentOwnerId(currentUserId);
        batch.setCurrentOwnerRole(transfer.getRecipientRole());
        batch.setLastStatusChangeAt(LocalDateTime.now());
        batch.setLastStatusChangedBy(currentUserId);
        
        // ✅ NEW: Track ownership history (append to existing history or create new)
        updateOwnershipHistory(batch, currentUserId, transfer.getRecipientRole());
        
        // Set distributor/retailer ID for backward compatibility
        if ("DISTRIBUTOR".equals(transfer.getRecipientRole())) {
            batch.setDistributorId(currentUserId);
        } else if ("RETAILER".equals(transfer.getRecipientRole())) {
            batch.setRetailerId(currentUserId);
        }
        
        batchRepository.save(batch);

        // Get current user to get their role
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        String currentUserRole = currentUser != null ? currentUser.getRole().name() : "UNKNOWN";

        // Create activity log for recipient
        createActivity(currentUserId, currentUserRole, "BATCH_ACCEPTED",
                "Batch Transfer Accepted",
                "Accepted transfer of batch " + transfer.getBatchId() + " (Auto-status: " + autoStatus + ")",
                transfer.getBatchId());

        // Create notification for sender
        createNotification(transfer.getSenderId(), "BATCH_ACCEPTED",
                "Batch Transfer Accepted",
                "Your batch transfer has been accepted by the recipient. Batch status: " + BatchStatusHelper.getStatusLabel(autoStatus),
                transfer.getBatchId());

        // ── Create supply chain event (RECEIVED stage) ────────────────────────
        try {
            User currentUserObj = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
            
            SupplyChainEvent receivedEvent = new SupplyChainEvent();
            receivedEvent.setBatchId(transfer.getBatchId());
            receivedEvent.setStage(SupplyChainEvent.SupplyChainStage.RECEIVED);
            receivedEvent.setActorId(currentUserId);
            receivedEvent.setActorName(currentUserObj.getFullName());
            receivedEvent.setActorRole(transfer.getRecipientRole());
            receivedEvent.setLocation(currentUserObj.getFullName() + "'s Facility");
            receivedEvent.setTimestamp(java.time.LocalDateTime.now());
            if (batch.getPricePerUnit() != null) {
                receivedEvent.setUnitPrice(batch.getPricePerUnit());
                receivedEvent.setNotes("Transfer received at unit price INR " + batch.getPricePerUnit());
            }
            
            // Log the supply chain event
            supplyChainService.logSupplyChainEvent(receivedEvent);
            
            log.info("✅ Supply chain event created for batch: {} (RECEIVED stage)", transfer.getBatchId());
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to create supply chain event for batch acceptance: {}", e.getMessage());
            // Don't fail the acceptance if supply chain logging fails
        }
        // ─────────────────────────────────────────────────────────────────────

        return updated;
    }

    /**
     * ✅ NEW: Update ownership history JSON array
     * Tracks all ownership transitions for audit trail
     *
     * @param batch The batch entity
     * @param newOwnerId The new owner's ID
     * @param newOwnerRole The new owner's role
     */
    private void updateOwnershipHistory(Batch batch, Long newOwnerId, String newOwnerRole) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> history = new ArrayList<>();

            // Parse existing history if present
            if (batch.getOwnershipHistory() != null && !batch.getOwnershipHistory().trim().isEmpty()) {
                history = mapper.readValue(batch.getOwnershipHistory(),
                        mapper.getTypeFactory().constructCollectionType(List.class, Map.class));
            }

            // Add new ownership record
            Map<String, Object> ownershipRecord = new HashMap<>();
            ownershipRecord.put("userId", newOwnerId);
            ownershipRecord.put("role", newOwnerRole);
            ownershipRecord.put("acquiredAt", LocalDateTime.now());
            history.add(ownershipRecord);

            // Serialize back to JSON
            batch.setOwnershipHistory(mapper.writeValueAsString(history));
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to update ownership history for batch {}: {}", batch.getId(), e.getMessage());
            // Don't fail if history tracking fails
        }
    }

    /**
     * Reject a pending batch transfer
     * ✅ UPDATED: Reverts batch to HARVESTED status for retry
     * 
     * @param currentUserId The recipient's ID (current user)
     * @param transferId The transfer ID to reject
     * @param rejectionReason Optional reason for rejection
     * @return The updated BatchTransfer
     */
    @Transactional
    public BatchTransfer rejectTransfer(Long currentUserId, String transferId, String rejectionReason) {
        BatchTransfer transfer = batchTransferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found: " + transferId));

        // Validate current user is the recipient
        if (!transfer.getRecipientId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: You are not the recipient of this transfer");
        }

        // Validate transfer is in PENDING status
        if (transfer.getTransferStatus() != BatchTransfer.TransferStatus.PENDING) {
            throw new RuntimeException("Transfer cannot be rejected. Current status: " + transfer.getTransferStatus());
        }

        // Update transfer status
        transfer.setTransferStatus(BatchTransfer.TransferStatus.REJECTED);
        if (rejectionReason != null && !rejectionReason.isEmpty()) {
            transfer.setInspectionNote(rejectionReason);
        }
        BatchTransfer updated = batchTransferRepository.save(transfer);

        // ✅ UPDATED: Revert batch status to HARVESTED (ready for retry), not ACTIVE
        Batch batch = batchRepository.findById(transfer.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        batch.setStatus(Batch.BatchStatus.HARVESTED);
        
        // ✅ Batch remains owned by original sender (farmer)
        batch.setLastStatusChangeAt(LocalDateTime.now());
        batch.setLastStatusChangedBy(currentUserId);
        
        batchRepository.save(batch);

        // Get current user to get their role
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        String currentUserRole = currentUser != null ? currentUser.getRole().name() : "UNKNOWN";

        // Create activity log for recipient
        createActivity(currentUserId, currentUserRole, "BATCH_REJECTED",
                "Batch Transfer Rejected",
                "Rejected transfer of batch " + transfer.getBatchId() + " - Reason: " + (rejectionReason != null ? rejectionReason : "Not specified"),
                transfer.getBatchId());

        // Create notification for sender
        createNotification(transfer.getSenderId(), "BATCH_REJECTED",
                "Batch Transfer Rejected",
                "Your batch transfer has been rejected. Batch returned to HARVESTED status for retry.",
                transfer.getBatchId());

        return updated;
    }

    /**
     * Cancel a pending transfer (by sender)
     * ✅ UPDATED: Reverts batch to HARVESTED status
     * 
     * @param currentUserId The sender's ID
     * @param transferId The transfer ID to cancel
     */
    @Transactional
    public void cancelTransfer(Long currentUserId, String transferId) {
        BatchTransfer transfer = batchTransferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found: " + transferId));

        // Validate current user is the sender
        if (!transfer.getSenderId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: You are not the sender of this transfer");
        }

        // Validate transfer is in PENDING status
        if (transfer.getTransferStatus() != BatchTransfer.TransferStatus.PENDING) {
            throw new RuntimeException("Transfer cannot be cancelled. Current status: " + transfer.getTransferStatus());
        }

        // Update transfer status
        transfer.setTransferStatus(BatchTransfer.TransferStatus.CANCELLED);
        batchTransferRepository.save(transfer);

        // ✅ UPDATED: Revert batch status to HARVESTED (not ACTIVE)
        Batch batch = batchRepository.findById(transfer.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        batch.setStatus(Batch.BatchStatus.HARVESTED);
        batch.setLastStatusChangeAt(LocalDateTime.now());
        batch.setLastStatusChangedBy(currentUserId);
        batchRepository.save(batch);

        // Get current user to get their role
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        String currentUserRole = currentUser != null ? currentUser.getRole().name() : "UNKNOWN";

        // Create activity log
        createActivity(currentUserId, currentUserRole, "BATCH_TRANSFER_CANCELLED",
                "Batch Transfer Cancelled",
                "Cancelled transfer of batch " + transfer.getBatchId(),
                transfer.getBatchId());

        // Create notification for recipient
        createNotification(transfer.getRecipientId(), "BATCH_TRANSFER_CANCELLED",
                "Batch Transfer Cancelled",
                "The batch transfer has been cancelled by the sender. Batch returned to HARVESTED status.",
                transfer.getBatchId());
    }

    // ========== HELPER METHODS ==========

    private void createActivity(Long userId, String userRole, String actionType, String title, String description, String batchId) {
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

    private void createNotification(Long userId, String type, String title, String message, String batchId) {
        notificationService.createNotification(userId, 
            new infosys.project.farmchainxai.dto.CreateNotificationRequest(type, title, message, batchId));
    }

    /**
     * Validate transfer permissions based on sender and recipient roles
     * Rules:
     * - FARMER can transfer to: CONSUMER, DISTRIBUTOR, RETAILER
     * - DISTRIBUTOR can transfer to: RETAILER, CONSUMER
     * - RETAILER cannot transfer
     * - CONSUMER cannot transfer
     * @param senderRole The sender's role
     * @param recipientRole The recipient's role
     * @throws RuntimeException if transfer is not allowed
     */
    private void validateTransferPermissions(User.UserRole senderRole, User.UserRole recipientRole) {
        switch (senderRole) {
            case FARMER:
                // Farmers can transfer to CONSUMER, DISTRIBUTOR, RETAILER
                if (!isAllowedRecipient(recipientRole, User.UserRole.CONSUMER, User.UserRole.DISTRIBUTOR, User.UserRole.RETAILER)) {
                    throw new RuntimeException(
                            "Farmer can only transfer batches to CONSUMER, DISTRIBUTOR, or RETAILER. " +
                            "Cannot transfer to: " + recipientRole.name()
                    );
                }
                break;

            case DISTRIBUTOR:
                // Distributors can transfer to RETAILER, CONSUMER
                if (!isAllowedRecipient(recipientRole, User.UserRole.RETAILER, User.UserRole.CONSUMER)) {
                    throw new RuntimeException(
                            "Distributor can only transfer batches to RETAILER or CONSUMER. " +
                            "Cannot transfer to: " + recipientRole.name()
                    );
                }
                break;

            case RETAILER:
                // Retailers cannot transfer
                throw new RuntimeException("Retailer role cannot initiate batch transfers");

            case CONSUMER:
                // Consumers cannot transfer
                throw new RuntimeException("Consumer role cannot initiate batch transfers");

            case ADMIN:
                // Admins cannot transfer (can modify directly)
                throw new RuntimeException("Admin role cannot initiate batch transfers");

            default:
                throw new RuntimeException("Unknown sender role: " + senderRole.name());
        }
    }

    /**
     * Helper method to check if recipient role is in allowed roles
     */
    private boolean isAllowedRecipient(User.UserRole recipientRole, User.UserRole... allowedRoles) {
        for (User.UserRole allowed : allowedRoles) {
            if (recipientRole == allowed) {
                return true;
            }
        }
        return false;
    }
}

