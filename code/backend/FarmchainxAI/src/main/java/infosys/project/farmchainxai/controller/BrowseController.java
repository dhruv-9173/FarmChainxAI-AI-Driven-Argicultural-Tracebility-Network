package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.ApiResponse;
import infosys.project.farmchainxai.dto.BatchDto;
import infosys.project.farmchainxai.dto.CreateReviewRequest;
import infosys.project.farmchainxai.dto.ReviewDto;
import infosys.project.farmchainxai.dto.UserBrowseDto;
import infosys.project.farmchainxai.entity.Review;
import infosys.project.farmchainxai.entity.User;
import infosys.project.farmchainxai.repository.ReviewRepository;
import infosys.project.farmchainxai.repository.UserRepository;
import infosys.project.farmchainxai.service.FarmerService;
import infosys.project.farmchainxai.service.UserBrowseService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Controller for browsing user profiles.
 * Different roles have different access:
 * - FARMER: Can see DISTRIBUTOR and RETAILER profiles
 * - DISTRIBUTOR: Can see FARMER and RETAILER profiles
 * - RETAILER: Can see all profiles (FARMER, DISTRIBUTOR)
 */
@RestController
@RequestMapping("/api/v1/browse")
@Slf4j
public class BrowseController {

    @Autowired
    private UserBrowseService userBrowseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerService farmerService;

    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * Get all users that the current user can browse based on their role.
     * GET /api/v1/browse/users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserBrowseDto>>> getAllBrowsableUsers(Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> currentUser = userRepository.findByEmail(email);

            if (!currentUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("User not found", null, false));
            }

            User user = currentUser.get();
            List<User.UserRole> browsableRoles = getBrowsableRoles(user.getRole());

            List<UserBrowseDto> users = userBrowseService.getAllUsers(user.getId(), browsableRoles);

            return ResponseEntity.ok(
                    new ApiResponse<>("Users retrieved successfully", users, true)
            );
        } catch (Exception e) {
            log.error("Error fetching browsable users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve users: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get a specific user's profile by ID.
     * GET /api/v1/browse/users/{userId}
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserBrowseDto>> getUserProfile(
            Authentication authentication,
            @PathVariable Long userId) {
        try {
            String email = authentication.getName();
            Optional<User> currentUser = userRepository.findByEmail(email);

            if (!currentUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("User not found", null, false));
            }

            // Verify access rights
            User user = currentUser.get();
            Optional<User> targetUser = userRepository.findById(userId);

            if (!targetUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Target user not found", null, false));
            }

            List<User.UserRole> browsableRoles = getBrowsableRoles(user.getRole());
            if (!browsableRoles.contains(targetUser.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("You do not have access to view this user's profile", null, false));
            }

            UserBrowseDto profile = userBrowseService.getUserProfile(userId);
            return ResponseEntity.ok(
                    new ApiResponse<>("User profile retrieved successfully", profile, true)
            );
        } catch (Exception e) {
            log.error("Error fetching user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve user profile: " + e.getMessage(), null, false));
        }
    }

    /**
     * Search for users by name or email.
     * GET /api/v1/browse/search?q=searchTerm
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserBrowseDto>>> searchUsers(
            Authentication authentication,
            @RequestParam String q) {
        try {
            String email = authentication.getName();
            Optional<User> currentUser = userRepository.findByEmail(email);

            if (!currentUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("User not found", null, false));
            }

            User user = currentUser.get();
            List<User.UserRole> browsableRoles = getBrowsableRoles(user.getRole());

            List<UserBrowseDto> results = userBrowseService.searchUsers(q, browsableRoles);

            return ResponseEntity.ok(
                    new ApiResponse<>("Search completed successfully", results, true)
            );
        } catch (Exception e) {
            log.error("Error searching users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to search users: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get batch details by batch ID for QR scanning/traceability.
     * GET /api/v1/browse/batches/{batchId}
     * Public endpoint (no authentication required)
     */
    @GetMapping("/batches/{batchId}")
    public ResponseEntity<ApiResponse<BatchDto>> getBatchDetails(
            @PathVariable String batchId) {
        try {
            BatchDto batch = farmerService.getBatchById(batchId);
            return ResponseEntity.ok(
                    new ApiResponse<>("Batch details retrieved successfully", batch, true)
            );
        } catch (RuntimeException e) {
            log.error("Error fetching batch details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Batch not found: " + e.getMessage(), null, false));
        } catch (Exception e) {
            log.error("Error fetching batch details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve batch details: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get all reviews for a batch.
     * GET /api/v1/browse/batches/{batchId}/reviews
     * Public endpoint (no authentication required)
     */
    @GetMapping("/batches/{batchId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getBatchReviews(
            @PathVariable String batchId) {
        try {
            // Verify batch exists
            farmerService.getBatchById(batchId);

            // Get all reviews for this batch
            List<ReviewDto> reviews = reviewRepository.findByBatchIdOrderByCreatedAtDesc(batchId)
                    .stream()
                    .map(this::mapToReviewDto)
                    .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            "Reviews retrieved successfully",
                            reviews,
                            true
                    )
            );
        } catch (RuntimeException e) {
            log.error("Error fetching reviews: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Batch not found", null, false));
        } catch (Exception e) {
            log.error("Error fetching reviews: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve reviews", null, false));
        }
    }

    /**
     * Submit a review for a batch.
     * POST /api/v1/browse/batches/{batchId}/reviews
     * Public endpoint - allows anonymous or authenticated reviews
     */
    @PostMapping("/batches/{batchId}/reviews")
    public ResponseEntity<ApiResponse<ReviewDto>> submitReview(
            @PathVariable String batchId,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {
        try {
            // Verify batch exists
            farmerService.getBatchById(batchId);

            // Validate request
            if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Rating must be between 1 and 5", null, false));
            }

            if (request.getComment() == null || request.getComment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Comment cannot be empty", null, false));
            }

            // Create review record
            Review review = Review.builder()
                    .id("REV-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 10000))
                    .batchId(batchId)
                    .rating(request.getRating())
                    .comment(request.getComment().trim())
                    .build();

            // If authenticated, add user details
            if (authentication != null && authentication.isAuthenticated()) {
                Optional<User> user = userRepository.findByEmail(authentication.getName());
                if (user.isPresent()) {
                    review.setUserId(user.get().getId());
                    review.setUserDisplayName(user.get().getFullName() != null ? user.get().getFullName() : "Anonymous");
                    review.setUserRole(user.get().getRole().name());
                }
            } else {
                // Anonymous review
                review.setUserDisplayName("Anonymous");
            }

            Review saved = reviewRepository.save(review);
            ReviewDto dto = mapToReviewDto(saved);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Review submitted successfully", dto, true));

        } catch (RuntimeException e) {
            log.error("Error submitting review: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Batch not found", null, false));
        } catch (Exception e) {
            log.error("Error submitting review: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to submit review", null, false));
        }
    }

    /**
     * Map Review entity to ReviewDto.
     */
    private ReviewDto mapToReviewDto(Review review) {
        String formattedDate = review.getCreatedAt() != null
                ? review.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM, yyyy"))
                : "";

        return ReviewDto.builder()
                .id(review.getId())
                .batchId(review.getBatchId())
                .userId(review.getUserId())
                .userDisplayName(review.getUserDisplayName())
                .rating(review.getRating())
                .comment(review.getComment())
                .userRole(review.getUserRole())
                .formattedDate(formattedDate)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    /**
     * Determine which user roles the current user can browse based on their role.
     */
    private List<User.UserRole> getBrowsableRoles(User.UserRole userRole) {
        return switch (userRole) {
            case FARMER -> Arrays.asList(User.UserRole.DISTRIBUTOR, User.UserRole.RETAILER);
            case DISTRIBUTOR -> Arrays.asList(User.UserRole.FARMER, User.UserRole.RETAILER);
            case RETAILER -> Arrays.asList(User.UserRole.FARMER, User.UserRole.DISTRIBUTOR);
            case ADMIN -> Arrays.asList(User.UserRole.FARMER, User.UserRole.DISTRIBUTOR, User.UserRole.RETAILER);
            default -> Arrays.asList();
        };
    }
}
