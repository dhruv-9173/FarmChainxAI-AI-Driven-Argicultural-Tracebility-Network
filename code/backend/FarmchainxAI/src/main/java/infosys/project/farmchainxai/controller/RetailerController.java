package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.service.RetailerService;
import infosys.project.farmchainxai.service.QualityCheckService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RetailerController
 * Complete API for retailer operations including inventory, sales, and quality checks
 */
@RestController
@RequestMapping("/api/v1/retailer")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RetailerController {

    @Autowired
    private RetailerService retailerService;

    @Autowired
    private QualityCheckService qualityCheckService;

    // ========== PROFILE ENDPOINTS ==========

    /**
     * GET /api/v1/retailer/profile
     * Get retailer profile information
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<RetailerProfileDto>> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            RetailerProfileDto profile = retailerService.getRetailerProfile(email);
            return ResponseEntity.ok(new ApiResponse<>("Profile retrieved successfully", profile, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Failed to retrieve profile: " + e.getMessage(), null, false));
        }
    }

    /**
     * PATCH /api/v1/retailer/profile
     * Update retailer profile
     */
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<RetailerProfileDto>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody RetailerProfileDto request) {
        try {
            String email = authentication.getName();
            RetailerProfileDto updated = retailerService.updateRetailerProfile(email, request);
            return ResponseEntity.ok(new ApiResponse<>("Profile updated successfully", updated, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to update profile: " + e.getMessage(), null, false));
        }
    }

    // ========== INVENTORY ENDPOINTS ==========

    /**
     * GET /api/v1/retailer/inventory
     * Get all batches in retailer's inventory
     */
    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<BatchDto>>> getInventory(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<BatchDto> inventory = retailerService.getRetailerInventory(email);
            return ResponseEntity.ok(new ApiResponse<>("Inventory retrieved successfully", inventory, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve inventory: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/retailer/inventory/summary
     * Get inventory summary (counts, quantities, categories)
     */
    @GetMapping("/inventory/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventorySummary(Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> summary = retailerService.getInventorySummary(email);
            return ResponseEntity.ok(new ApiResponse<>("Summary retrieved successfully", summary, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to get summary: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/retailer/batches/received
     * Get batches received by the retailer (auto-accepted from BatchTransfer records)
     */
    @GetMapping("/batches/received")
    public ResponseEntity<ApiResponse<List<DistributorBatchDto>>> getReceivedBatches(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<DistributorBatchDto> batches = retailerService.getRetailerReceivedBatches(email);
            return ResponseEntity.ok(new ApiResponse<>("Received batches retrieved successfully", batches, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve batches: " + e.getMessage(), null, false));
        }
    }


    /**
     * GET /api/v1/retailer/batches/expiring
     * Get expiring batches (shelf life < 5 days)
     */
    @GetMapping("/batches/expiring")
    public ResponseEntity<ApiResponse<List<BatchDto>>> getExpiringBatches(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<BatchDto> batches = retailerService.getExpiringBatches(email);
            return ResponseEntity.ok(new ApiResponse<>("Expiring batches retrieved successfully", batches, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve expiring batches: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/retailer/batches/quality-alerts
     * Get quality warnings and expired batches
     */
    @GetMapping("/batches/quality-alerts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQualityAlerts(Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> alerts = retailerService.getQualityAlerts(email);
            return ResponseEntity.ok(new ApiResponse<>("Quality alerts retrieved successfully", alerts, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to get alerts: " + e.getMessage(), null, false));
        }
    }

    // ========== SALES ENDPOINTS ==========

    /**
     * POST /api/v1/retailer/batches/{batchId}/mark-sold
     * Mark batch as sold and create SOLD supply chain event
     */
    @PostMapping("/batches/{batchId}/mark-sold")
    public ResponseEntity<ApiResponse<BatchDto>> markBatchAsSold(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody MarkBatchSoldRequest request) {
        try {
            String email = authentication.getName();
            BatchDto batch = retailerService.markBatchAsSold(email, batchId, request);
            return ResponseEntity.ok(new ApiResponse<>("Batch marked as sold successfully", batch, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to mark batch as sold: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/retailer/analytics/sales
     * Get sales analytics and revenue metrics
     */
    @GetMapping("/analytics/sales")
    public ResponseEntity<ApiResponse<List<RetailerAnalyticsPointDto>>> getSalesAnalytics(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<RetailerAnalyticsPointDto> analytics = retailerService.getSalesAnalytics(email);
            return ResponseEntity.ok(new ApiResponse<>("Sales analytics retrieved successfully", analytics, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to get analytics: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/retailer/activities
     * Get recent retailer activities
     */
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<ActivityItemDto>>> getRetailerActivities(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<ActivityItemDto> activities = retailerService.getRetailerActivities(email);
            return ResponseEntity.ok(new ApiResponse<>("Activities retrieved successfully", activities, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to get activities: " + e.getMessage(), null, false));
        }
    }

    // ========== QUALITY CHECK ENDPOINTS ==========

    /**
     * GET /api/v1/retailer/quality-checks/pending
     * Get pending QC items for this retailer
     */
    @GetMapping("/quality-checks/pending")
    public ResponseEntity<ApiResponse<List<QualityCheckDto>>> getPendingQC(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<QualityCheckDto> pending = qualityCheckService.getPendingQCItems(email);
            return ResponseEntity.ok(new ApiResponse<>("Pending QC items retrieved successfully", pending, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve pending QC: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/retailer/quality-checks/{batchId}/initiate
     * Initiate quality check for a batch
     */
    @PostMapping("/quality-checks/{batchId}/initiate")
    public ResponseEntity<ApiResponse<QualityCheckDto>> initiateQC(
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
                    .body(new ApiResponse<>("Failed to initiate QC: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/retailer/quality-checks/{batchId}/approve
     * Approve batch after QC (quality passed)
     */
    @PostMapping("/quality-checks/{batchId}/approve")
    public ResponseEntity<ApiResponse<QualityCheckDto>> approveQC(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody ApproveQCRequest request) {
        try {
            String email = authentication.getName();
            QualityCheckDto approved = qualityCheckService.approveQualityCheck(email, batchId, request);
            return ResponseEntity.ok(new ApiResponse<>("Quality check approved successfully", approved, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to approve QC: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/retailer/quality-checks/{batchId}/reject
     * Reject batch if QC fails
     */
    @PostMapping("/quality-checks/{batchId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectQC(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody RejectQCRequest request) {
        try {
            String email = authentication.getName();
            qualityCheckService.rejectAfterQC(email, batchId, request);
            return ResponseEntity.ok(new ApiResponse<>("Quality check rejected successfully", null, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to reject QC: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/retailer/quality-checks/{batchId}/status
     * Get QC status for a batch
     */
    @GetMapping("/quality-checks/{batchId}/status")
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

    // ========== BATCH OPERATIONS ENDPOINTS ==========

    /**
     * POST /api/v1/retailer/batches/{batchId}/accept
     * Accept batch after receiving (before QC)
     */
    @PostMapping("/batches/{batchId}/accept")
    public ResponseEntity<ApiResponse<BatchDto>> acceptBatch(
            Authentication authentication,
            @PathVariable String batchId,
            @RequestBody(required = false) BatchAcceptRequest request) {
        try {
            String email = authentication.getName();
            String notes = request != null ? request.getInspectionNote() : "";
            Double shelfPrice = request != null ? request.getShelfPrice() : null;
            BatchDto batch = retailerService.acceptBatch(email, batchId, notes != null ? notes : "", shelfPrice);
            return ResponseEntity.ok(new ApiResponse<>("Batch accepted successfully", batch, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to accept batch: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/retailer/batches/{batchId}/reject
     * Reject batch / request return to distributor
     */
    @PostMapping("/batches/{batchId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectBatch(
            Authentication authentication,
            @PathVariable String batchId,
            @RequestParam String reason) {
        try {
            String email = authentication.getName();
            retailerService.rejectAndReturnBatch(email, batchId, reason);
            return ResponseEntity.ok(new ApiResponse<>("Batch rejected successfully", null, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to reject batch: " + e.getMessage(), null, false));
        }
    }
}
