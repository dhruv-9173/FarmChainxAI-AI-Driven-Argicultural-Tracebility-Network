package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.ApiResponse;
import infosys.project.farmchainxai.dto.InitiateBatchTransferRequest;
import infosys.project.farmchainxai.dto.TransferRecipientDto;
import infosys.project.farmchainxai.entity.BatchTransfer;
import infosys.project.farmchainxai.entity.User;
import infosys.project.farmchainxai.repository.UserRepository;
import infosys.project.farmchainxai.service.BatchTransferService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transfers")
public class BatchTransferController {

    @Autowired
    private BatchTransferService batchTransferService;
    
    @Autowired
    
    private UserRepository userRepository;
    
    /**
     * ✅ Helper method to extract user ID from JWT token
     * Converts email from JWT to numeric user ID by database lookup
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return user.getId();
    }
    
    @GetMapping("/recipients")
    public ResponseEntity<ApiResponse<List<TransferRecipientDto>>> getTransferRecipients(
            Authentication authentication,
            @RequestParam(name = "role") String role) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<TransferRecipientDto> recipients = batchTransferService.getTransferRecipientsByRole(userId, role);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Transfer recipients retrieved successfully",
                    recipients,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to retrieve transfer recipients: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Search users of a specific role by name or email
     * GET /api/v1/transfers/search?role=DISTRIBUTOR&query=Mr.+Distributer
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TransferRecipientDto>>> searchUsersByRole(
            Authentication authentication,
            @RequestParam(name = "role") String role,
            @RequestParam(name = "query") String query) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<TransferRecipientDto> results = batchTransferService.searchUsersByRole(userId, role, query);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Users found successfully",
                    results,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Search failed: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Initiate a batch transfer
     * POST /api/v1/transfers/initiate
     */
    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiateBatchTransfer(
            Authentication authentication,
            @Valid @RequestBody InitiateBatchTransferRequest request) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            BatchTransfer transfer = batchTransferService.initiateBatchTransfer(userId, request);

            Map<String, Object> response = new HashMap<>();
            response.put("transferId", transfer.getId());
            response.put("batchId", transfer.getBatchId());
            response.put("recipientId", transfer.getRecipientId());
            response.put("status", transfer.getTransferStatus().name());
            response.put("createdAt", transfer.getCreatedAt());

            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                    "Batch transfer initiated successfully",
                    response,
                    true
            ));
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            HttpStatus status = HttpStatus.BAD_REQUEST;
            
            // Determine appropriate HTTP status
            if (errorMessage.contains("Unauthorized") || errorMessage.contains("cannot initiate")) {
                status = HttpStatus.FORBIDDEN;
            } else if (errorMessage.contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            }

            return ResponseEntity.status(status)
                    .body(new ApiResponse<>(
                            "Failed to initiate transfer: " + errorMessage,
                            null,
                            false
                    ));
        }
    }

    /**
     * Accept a batch transfer (by recipient)
     * POST /api/v1/transfers/{transferId}/accept
     */
    @PostMapping("/{transferId}/accept")
    public ResponseEntity<ApiResponse<Map<String, Object>>> acceptTransfer(
            Authentication authentication,
            @PathVariable String transferId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            String inspectionNote = requestBody != null ? requestBody.get("inspectionNote") : null;

            BatchTransfer transfer = batchTransferService.acceptTransfer(userId, transferId, inspectionNote);

            Map<String, Object> response = new HashMap<>();
            response.put("transferId", transfer.getId());
            response.put("batchId", transfer.getBatchId());
            response.put("status", transfer.getTransferStatus().name());
            response.put("acceptedAt", transfer.getUpdatedAt());

            return ResponseEntity.ok(new ApiResponse<>(
                    "Batch transfer accepted successfully",
                    response,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to accept transfer: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Reject a batch transfer (by recipient)
     * POST /api/v1/transfers/{transferId}/reject
     */
    @PostMapping("/{transferId}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectTransfer(
            Authentication authentication,
            @PathVariable String transferId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            String rejectionReason = requestBody != null ? requestBody.get("rejectionReason") : null;

            BatchTransfer transfer = batchTransferService.rejectTransfer(userId, transferId, rejectionReason);

            Map<String, Object> response = new HashMap<>();
            response.put("transferId", transfer.getId());
            response.put("batchId", transfer.getBatchId());
            response.put("status", transfer.getTransferStatus().name());
            response.put("rejectedAt", transfer.getUpdatedAt());

            return ResponseEntity.ok(new ApiResponse<>(
                    "Batch transfer rejected successfully",
                    response,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to reject transfer: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Cancel a batch transfer (by sender)
     * DELETE /api/v1/transfers/{transferId}
     */
    @DeleteMapping("/{transferId}")
    public ResponseEntity<ApiResponse<Void>> cancelTransfer(
            Authentication authentication,
            @PathVariable String transferId) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            batchTransferService.cancelTransfer(userId, transferId);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Batch transfer cancelled successfully",
                    null,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to cancel transfer: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    @GetMapping("/batches/{batchId}/receipt")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBatchTransferReceipt(
            Authentication authentication,
            @PathVariable String batchId) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            Map<String, Object> receipt = batchTransferService.getLatestTransferReceiptForFarmer(userId, batchId);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Transfer receipt retrieved successfully",
                    receipt,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to retrieve transfer receipt: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }
}

