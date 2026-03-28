package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.ApiResponse;
import infosys.project.farmchainxai.dto.NotificationDto;
import infosys.project.farmchainxai.dto.CreateNotificationRequest;
import infosys.project.farmchainxai.entity.User;
import infosys.project.farmchainxai.repository.UserRepository;
import infosys.project.farmchainxai.service.NotificationService;
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
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper method to extract user ID from authentication
     * Converts email (authentication.getName()) to user ID
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    /**
     * Get 50 most recent new (unread) notifications
     * GET /api/v1/notifications/new
     */
    @GetMapping("/new")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNewNotifications(
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<NotificationDto> notifications = notificationService.getNewNotifications(userId);
            return ResponseEntity.ok(new ApiResponse<>(
                    "New notifications retrieved successfully",
                    notifications,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to retrieve notifications: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Get all unread notifications
     * GET /api/v1/notifications/unread
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUnreadNotifications(
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Unread notifications retrieved successfully",
                    notifications,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to retrieve unread notifications: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Get all notifications (paginated, 50 per page)
     * GET /api/v1/notifications?page=0
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications(
            Authentication authentication,
            @RequestParam(name = "page", defaultValue = "0") int page) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<NotificationDto> notifications = notificationService.getNotifications(userId, page);
            long unreadCount = notificationService.getUnreadCount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notifications);
            response.put("unreadCount", unreadCount);
            response.put("page", page);
            response.put("pageSize", 50);

            return ResponseEntity.ok(new ApiResponse<>(
                    "Notifications retrieved successfully",
                    response,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to retrieve notifications: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Get count of unread notifications
     * GET /api/v1/notifications/unread/count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            long unreadCount = notificationService.getUnreadCount(userId);

            Map<String, Long> response = new HashMap<>();
            response.put("unreadCount", unreadCount);

            return ResponseEntity.ok(new ApiResponse<>(
                    "Unread count retrieved successfully",
                    response,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to get unread count: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Create a new notification for the current user
     * POST /api/v1/notifications
     */
    @PostMapping
    public ResponseEntity<ApiResponse<NotificationDto>> createNotification(
            Authentication authentication,
            @Valid @RequestBody CreateNotificationRequest request) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            NotificationDto notification = notificationService.createNotification(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                    "Notification created successfully",
                    notification,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to create notification: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Mark a notification as read
     * PATCH /api/v1/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Notification marked as read",
                    null,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            "Failed to mark as read: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Mark multiple notifications as read
     * POST /api/v1/notifications/mark-as-read
     */
    @PostMapping("/mark-as-read")
    public ResponseEntity<ApiResponse<Void>> markMultipleAsRead(
            @RequestBody Map<String, List<String>> request) {
        try {
            List<String> notificationIds = request.get("notificationIds");
            if (notificationIds == null || notificationIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(
                                "Notification IDs list is required",
                                null,
                                false
                        ));
            }
            notificationService.markMultipleAsRead(notificationIds);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Notifications marked as read",
                    null,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to mark notifications as read: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Mark all notifications as read for the current user
     * PATCH /api/v1/notifications/mark-all-as-read
     */
    @PatchMapping("/mark-all-as-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(new ApiResponse<>(
                    "All notifications marked as read",
                    null,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to mark all as read: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Delete a notification
     * DELETE /api/v1/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable String id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Notification deleted successfully",
                    null,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            "Failed to delete notification: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    /**
     * Delete all notifications for the current user
     * DELETE /api/v1/notifications/all
     */
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            notificationService.deleteAllNotifications(userId);
            return ResponseEntity.ok(new ApiResponse<>(
                    "All notifications deleted successfully",
                    null,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to delete notifications: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }
}

