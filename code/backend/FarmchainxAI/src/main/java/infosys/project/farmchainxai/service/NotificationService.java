package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.NotificationDto;
import infosys.project.farmchainxai.dto.CreateNotificationRequest;
import infosys.project.farmchainxai.entity.Notification;
import infosys.project.farmchainxai.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Get 50 most recent NEW notifications for a user
     * @param userId The user ID
     * @return List of up to 50 unread notifications
     */
    public List<NotificationDto> getNewNotifications(Long userId) {
        Pageable pageable = PageRequest.of(0, 50);
        return notificationRepository.findByUserIdAndIsRead(userId, false, pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all notifications for a user (paginated, 50 per page)
     * @param userId The user ID
     * @param page Page number (0-indexed)
     * @return List of notifications for that page
     */
    public List<NotificationDto> getNotifications(Long userId, int page) {
        Pageable pageable = PageRequest.of(page, 50);
        return notificationRepository.findByUserId(userId, pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all unread notifications for a user
     * @param userId The user ID
     * @return List of unread notifications
     */
    public List<NotificationDto> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.getIsRead())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create and save a new notification
     * @param userId The user ID to notify
     * @param request The notification details
     * @return The created notification
     */
    @Transactional
    public NotificationDto createNotification(Long userId, CreateNotificationRequest request) {
        // Validate user ID
        if (userId == null || userId <= 0) {
            throw new RuntimeException("Invalid user ID");
        }

        // Validate request
        if (request.getTitle() == null || request.getTitle().isEmpty()) {
            throw new RuntimeException("Notification title is required");
        }
        if (request.getMessage() == null || request.getMessage().isEmpty()) {
            throw new RuntimeException("Notification message is required");
        }
        if (request.getType() == null || request.getType().isEmpty()) {
            throw new RuntimeException("Notification type is required");
        }

        // Create notification entity
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .relatedBatchId(request.getRelatedBatchId())
                .isRead(false)
                .build();

        // Save to database
        Notification saved = notificationRepository.save(notification);

        return mapToDto(saved);
    }

    /**
     * Mark a notification as read
     * @param notificationId The notification ID
     */
    @Transactional
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Mark multiple notifications as read
     * @param notificationIds List of notification IDs
     */
    @Transactional
    public void markMultipleAsRead(List<String> notificationIds) {
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    /**
     * Mark all notifications as read for a user
     * @param userId The user ID
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());

        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Delete a notification
     * @param notificationId The notification ID
     */
    @Transactional
    public void deleteNotification(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        notificationRepository.delete(notification);
    }

    /**
     * Get count of unread notifications
     * @param userId The user ID
     * @return Count of unread notifications
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Delete all notifications for a user
     * @param userId The user ID
     */
    @Transactional
    public void deleteAllNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
    }

    // ========== HELPER METHODS ==========

    /**
     * Map Notification entity to NotificationDto
     */
    private NotificationDto mapToDto(Notification notification) {
        String createdAt = notification.getCreatedAt() != null
                ? notification.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                : "";

        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedBatchId(notification.getRelatedBatchId())
                .isRead(notification.getIsRead())
                .createdAt(createdAt)
                .createdAtDateTime(notification.getCreatedAt())
                .build();
    }
}

