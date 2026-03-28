package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.service.DistributorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/distributor")
public class DistributorController {

    @Autowired
    private DistributorService distributorService;

    // ========== PROFILE ENDPOINTS ==========

    /**
     * GET /api/v1/distributor/profile
     * Get distributor profile information
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DistributorProfileDto>> getDistributorProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            DistributorProfileDto profile = distributorService.getDistributorProfile(email);
            return ResponseEntity.ok(new ApiResponse<>("Profile retrieved successfully", profile, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Failed to retrieve profile: " + e.getMessage(), null, false));
        }
    }

    /**
     * PATCH /api/v1/distributor/profile
     * Update distributor profile
     */
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<DistributorProfileDto>> updateDistributorProfile(
            Authentication authentication,
            @Valid @RequestBody DistributorProfileDto request) {
        try {
            String email = authentication.getName();
            DistributorProfileDto updated = distributorService.updateDistributorProfile(email, request);
            return ResponseEntity.ok(new ApiResponse<>("Profile updated successfully", updated, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to update profile: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/distributor/profile/change-password
     * Change password for distributor
     */
    @PostMapping("/profile/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            String email = authentication.getName();
            distributorService.changePassword(email, request);
            return ResponseEntity.ok(new ApiResponse<>("Password changed successfully", null, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    // ========== DASHBOARD KPI ENDPOINTS ==========

    /**
     * GET /api/v1/distributor/kpis
     * Get KPI cards for dashboard
     */
    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<List<KpiCardDto>>> getKpis(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<KpiCardDto> kpis = distributorService.getKpis(email);
            return ResponseEntity.ok(new ApiResponse<>("KPIs retrieved successfully", kpis, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve KPIs: " + e.getMessage(), null, false));
        }
    }

    // ========== BATCH ENDPOINTS ==========

    /**
     * GET /api/v1/distributor/batches/received
     * Get all received batches (that have been accepted)
     */
    @GetMapping("/batches/received")
    public ResponseEntity<ApiResponse<List<DistributorBatchDto>>> getReceivedBatches(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<DistributorBatchDto> batches = distributorService.getReceivedBatches(email);
            return ResponseEntity.ok(new ApiResponse<>("Received batches retrieved successfully", batches, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve batches: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/distributor/batches/pending
     * Get all pending batches (awaiting approval)
     */
    @GetMapping("/batches/pending")
    public ResponseEntity<ApiResponse<List<DistributorBatchDto>>> getPendingBatches(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<DistributorBatchDto> batches = distributorService.getPendingBatches(email);
            return ResponseEntity.ok(new ApiResponse<>("Pending batches retrieved successfully", batches, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve pending batches: " + e.getMessage(), null, false));
        }
    }

    // ========== ACTIVITY ENDPOINTS ==========

    /**
     * GET /api/v1/distributor/activities
     * Get activity log for distributor
     */
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<DistributorActivityDto>>> getActivityLog(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<DistributorActivityDto> activities = distributorService.getActivityLog(email);
            return ResponseEntity.ok(new ApiResponse<>("Activities retrieved successfully", activities, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve activities: " + e.getMessage(), null, false));
        }
    }

    // ========== ANALYTICS ENDPOINTS ==========

    /**
     * GET /api/v1/distributor/analytics
     * Get analytics data for dashboard charts
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<List<DistributorAnalyticsDto>>> getAnalytics(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<DistributorAnalyticsDto> analytics = distributorService.getAnalytics(email);
            return ResponseEntity.ok(new ApiResponse<>("Analytics retrieved successfully", analytics, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve analytics: " + e.getMessage(), null, false));
        }
    }

    // ========== TRANSFER RECIPIENT ENDPOINTS ==========

    /**
     * GET /api/v1/distributor/transfer-recipients
     * Get list of retailers/consumers to transfer batches to
     */
    @GetMapping("/transfer-recipients")
    public ResponseEntity<ApiResponse<List<TransferRecipientDto>>> getTransferRecipients(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<TransferRecipientDto> recipients = distributorService.getRetailRecipients(email);
            return ResponseEntity.ok(new ApiResponse<>("Transfer recipients retrieved successfully", recipients, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve transfer recipients: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/distributor/search-retailers?query=searchTerm
     * Search for retailers to transfer batches to
     */
    @GetMapping("/search-retailers")
    public ResponseEntity<ApiResponse<List<TransferRecipientDto>>> searchRetailers(
            Authentication authentication,
            @RequestParam(name = "query", defaultValue = "") String searchQuery) {
        try {
            String email = authentication.getName();
            List<TransferRecipientDto> results = distributorService.searchRetailers(email, searchQuery);
            return ResponseEntity.ok(new ApiResponse<>("Search results retrieved successfully", results, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to search retailers: " + e.getMessage(), null, false));
        }
    }

    // ========== NOTIFICATION ENDPOINTS ==========

    /**
     * GET /api/v1/distributor/notifications
     * Get notifications for distributor
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<NotificationDto> notifications = distributorService.getNotifications(email);
            return ResponseEntity.ok(new ApiResponse<>("Notifications retrieved successfully", notifications, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve notifications: " + e.getMessage(), null, false));
        }
    }
}
