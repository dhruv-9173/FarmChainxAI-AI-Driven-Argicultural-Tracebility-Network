package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.ApiResponse;
import infosys.project.farmchainxai.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AnalyticsController
 * Admin analytics and insights endpoints
 */
@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/v1/analytics/dashboard-summary
     * Get high-level dashboard statistics
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardSummary(Authentication authentication) {
        try {
            Map<String, Object> summary = analyticsService.getDashboardSummary();
            return ResponseEntity.ok(new ApiResponse<>("Dashboard summary retrieved successfully", summary, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve dashboard summary: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/analytics/crops
     * Get crop statistical analysis
     */
    @GetMapping("/crops")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCropAnalytics(Authentication authentication) {
        try {
            Map<String, Object> crops = analyticsService.getCropAnalytics();
            return ResponseEntity.ok(new ApiResponse<>("Crop analytics retrieved successfully", crops, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve crop analytics: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/analytics/supply-chain
     * Get supply chain completion metrics
     */
    @GetMapping("/supply-chain")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSupplyChainMetrics(Authentication authentication) {
        try {
            Map<String, Object> metrics = analyticsService.getSupplyChainMetrics();
            return ResponseEntity.ok(new ApiResponse<>("Supply chain metrics retrieved successfully", metrics, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve supply chain metrics: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/analytics/users
     * Get user activity metrics
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserActivityMetrics(Authentication authentication) {
        try {
            Map<String, Object> userMetrics = analyticsService.getUserActivityMetrics();
            return ResponseEntity.ok(new ApiResponse<>("User metrics retrieved successfully", userMetrics, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve user metrics: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/analytics/reviews
     * Get review and rating analytics
     */
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReviewAnalytics(Authentication authentication) {
        try {
            Map<String, Object> reviews = analyticsService.getReviewAnalytics();
            return ResponseEntity.ok(new ApiResponse<>("Review analytics retrieved successfully", reviews, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve review analytics: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/analytics/monthly
     * Get monthly statistics
     */
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonthlyAnalytics(Authentication authentication) {
        try {
            Map<String, Object> monthly = analyticsService.getMonthlyAnalytics();
            return ResponseEntity.ok(new ApiResponse<>("Monthly analytics retrieved successfully", monthly, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve monthly analytics: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/analytics/quality-trends
     * Get quality trend analysis
     */
    @GetMapping("/quality-trends")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQualityTrendAnalytics(Authentication authentication) {
        try {
            Map<String, Object> trends = analyticsService.getQualityTrendAnalytics();
            return ResponseEntity.ok(new ApiResponse<>("Quality trends retrieved successfully", trends, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve quality trends: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/analytics/system-health
     * Get system health report
     */
    @GetMapping("/system-health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemHealth(Authentication authentication) {
        try {
            Map<String, Object> health = analyticsService.getSystemHealthReport();
            return ResponseEntity.ok(new ApiResponse<>("System health report retrieved successfully", health, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve system health: " + e.getMessage(), null, false));
        }
    }
}
