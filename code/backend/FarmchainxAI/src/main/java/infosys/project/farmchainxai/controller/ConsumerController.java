package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.service.ConsumerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ConsumerController
 * Endpoints for consumer operations including product receipt, consumption tracking, and reviews
 */
@RestController
@RequestMapping("/api/v1/consumer")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsumerController {

    @Autowired
    private ConsumerService consumerService;

    // ========== PROFILE ENDPOINTS ==========

    /**
     * GET /api/v1/consumer/profile
     * Get consumer profile information
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> profile = consumerService.getConsumerProfile(email);
            return ResponseEntity.ok(new ApiResponse<>("Profile retrieved successfully", profile, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Failed to retrieve profile: " + e.getMessage(), null, false));
        }
    }

    /**
     * PATCH /api/v1/consumer/profile
     * Update consumer profile
     */
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        try {
            String email = authentication.getName();
            Map<String, Object> updated = consumerService.updateConsumerProfile(email, request);
            return ResponseEntity.ok(new ApiResponse<>("Profile updated successfully", updated, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to update profile: " + e.getMessage(), null, false));
        }
    }

    // ========== PRODUCT ENDPOINTS ==========

    /**
     * GET /api/v1/consumer/products
     * Get all products purchased/received by consumer
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<BatchDto>>> getMyProducts(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<BatchDto> products = consumerService.getMyProducts(email);
            return ResponseEntity.ok(new ApiResponse<>("Products retrieved successfully", products, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve products: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/consumer/products/{batchId}/receive
     * Record product receipt (purchase at retail store)
     */
    @PostMapping("/products/{batchId}/receive")
    public ResponseEntity<ApiResponse<BatchDto>> receiveProduct(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody ConsumerReceiptRequest request) {
        try {
            String email = authentication.getName();
            BatchDto product = consumerService.receiveBatch(email, batchId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Product receipt recorded successfully", product, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to record receipt: " + e.getMessage(), null, false));
        }
    }

    /**
     * POST /api/v1/consumer/products/{batchId}/consume
     * Mark product as consumed
     */
    @PostMapping("/products/{batchId}/consume")
    public ResponseEntity<ApiResponse<Void>> consumeProduct(
            Authentication authentication,
            @PathVariable String batchId,
            @Valid @RequestBody ConsumerConsumptionRequest request) {
        try {
            String email = authentication.getName();
            consumerService.markBatchAsConsumed(email, batchId, request);
            return ResponseEntity.ok(new ApiResponse<>("Product marked as consumed successfully", null, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to mark as consumed: " + e.getMessage(), null, false));
        }
    }

    // ========== REVIEW ENDPOINTS ==========

    /**
     * POST /api/v1/consumer/products/{batchId}/review
     * Leave a review for a product/batch
     */
    @PostMapping("/products/{batchId}/review")
    public ResponseEntity<ApiResponse<Map<String, Object>>> leaveReview(
            Authentication authentication,
            @PathVariable String batchId,
            @RequestBody Map<String, Object> request) {
        try {
            String email = authentication.getName();
            Map<String, Object> review = consumerService.leaveReview(email, batchId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Review submitted successfully", review, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to submit review: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/consumer/reviews
     * Get all reviews left by this consumer
     */
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyReviews(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Map<String, Object>> reviews = consumerService.getMyReviews(email);
            return ResponseEntity.ok(new ApiResponse<>("Reviews retrieved successfully", reviews, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve reviews: " + e.getMessage(), null, false));
        }
    }

    /**
     * GET /api/v1/consumer/products/{batchId}/reviews
     * Get all reviews for a specific product/batch
     */
    @GetMapping("/products/{batchId}/reviews")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProductReviews(
            Authentication authentication,
            @PathVariable String batchId) {
        try {
            List<Map<String, Object>> reviews = consumerService.getBatchReviews(batchId);
            return ResponseEntity.ok(new ApiResponse<>("Product reviews retrieved successfully", reviews, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve product reviews: " + e.getMessage(), null, false));
        }
    }

    // ========== TRACEABILITY ENDPOINTS ==========

    /**
     * GET /api/v1/consumer/products/{batchId}/journey
     * Get product journey from farm to consumer
     * Shows complete supply chain history
     */
    @GetMapping("/products/{batchId}/journey")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductJourney(
            Authentication authentication,
            @PathVariable String batchId) {
        try {
            String email = authentication.getName();
            Map<String, Object> journey = consumerService.getProductJourney(email, batchId);
            return ResponseEntity.ok(new ApiResponse<>("Product journey retrieved successfully", journey, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Failed to retrieve product journey: " + e.getMessage(), null, false));
        }
    }
}
