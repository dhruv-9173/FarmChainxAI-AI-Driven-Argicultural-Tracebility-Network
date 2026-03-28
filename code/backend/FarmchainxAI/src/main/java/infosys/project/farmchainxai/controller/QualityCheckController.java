package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.service.QualityCheckService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * QualityCheckController
 * Dedicated endpoints for quality inspection workflow
 * Used by distributors and retailers for QC operations
 */
@RestController
@RequestMapping("/api/v1/quality-checks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class QualityCheckController {

    @Autowired
    private QualityCheckService qualityCheckService;

    /**
     * POST /api/v1/quality-checks/batches/{batchId}/initiate
     * Initiate quality check for a batch
     * Available for DISTRIBUTOR and RETAILER roles
     */
    @PostMapping("/batches/{batchId}/initiate")
    public ResponseEntity<ApiResponse<QualityCheckDto>> initiateQualityCheck(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody InitiateQCRequest request) {
        try {
            String email = authentication.getName();
            QualityCheckDto qc = qualityCheckService.initiateQualityCheck(email, batchId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Quality check initiated successfully", qc, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to initiate quality check: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/quality-checks/batches/{batchId}/approve
     * Approve batch after passing quality check
     */
    @PostMapping("/batches/{batchId}/approve")
    public ResponseEntity<ApiResponse<QualityCheckDto>> approveQualityCheck(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody ApproveQCRequest request) {
        try {
            String email = authentication.getName();
            QualityCheckDto approved = qualityCheckService.approveQualityCheck(email, batchId, request);
            return ResponseEntity.ok(new ApiResponse<>("Quality check approved successfully", approved, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to approve quality check: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/quality-checks/batches/{batchId}/reject
     * Reject batch if quality check fails
     */
    @PostMapping("/batches/{batchId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectQualityCheck(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody RejectQCRequest request) {
        try {
            String email = authentication.getName();
            qualityCheckService.rejectAfterQC(email, batchId, request);
            return ResponseEntity.ok(new ApiResponse<>("Quality check rejected successfully", null, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to reject quality check: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/quality-checks/pending
     * Get all pending QC items for the current user
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<QualityCheckDto>>> getPendingQCItems(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<QualityCheckDto> pending = qualityCheckService.getPendingQCItems(email);
            return ResponseEntity.ok(new ApiResponse<>("Pending QC items retrieved successfully", pending, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve pending QC items: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/quality-checks/batches/{batchId}/status
     * Get QC status and details for a batch
     */
    @GetMapping("/batches/{batchId}/status")
    public ResponseEntity<ApiResponse<QualityCheckDto>> getQCStatus(
            Authentication authentication,
            @PathVariable String batchId) {
        try {
            QualityCheckDto status = qualityCheckService.getQCStatus(batchId);
            return ResponseEntity.ok(new ApiResponse<>("QC status retrieved successfully", status, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Failed to retrieve QC status: " + e.getMessage(), null, false));
        }
    }
}
