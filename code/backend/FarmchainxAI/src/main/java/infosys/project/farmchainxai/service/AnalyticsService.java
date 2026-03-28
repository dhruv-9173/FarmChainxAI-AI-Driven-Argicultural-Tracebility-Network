package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AnalyticsService
 * Comprehensive analytics for admin dashboard and system insights
 */
@Service
@Slf4j
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private SupplyChainEventRepository supplyChainEventRepository;

    /**
     * Get dashboard summary statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalBatches = batchRepository.count();
        long totalEvents = supplyChainEventRepository.count();

        // Count by role
        Map<String, Long> usersByRole = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole().toString(),
                        Collectors.counting()
                ));

        // Count by batch status
        Map<String, Long> batchesByStatus = new HashMap<>();
        batchesByStatus.put("QUALITY_PASSED", batchRepository.findAll().stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.QUALITY_PASSED).count());
        batchesByStatus.put("DELIVERED", batchRepository.findAll().stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.DELIVERED).count());
        batchesByStatus.put("REJECTED_BY_DIST", batchRepository.findAll().stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.REJECTED_BY_DIST).count());
        batchesByStatus.put("EXPIRED", batchRepository.findAll().stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.EXPIRED).count());

        return Map.of(
                "totalUsers", totalUsers,
                "totalBatches", totalBatches,
                "totalSupplyChainEvents", totalEvents,
                "usersByRole", usersByRole,
                "batchesByStatus", batchesByStatus
        );
    }

    /**
     * Get crop statistical analysis
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCropAnalytics() {
        List<Batch> allBatches = batchRepository.findAll();

        // Group by crop type
        Map<String, Long> cropsCount = allBatches.stream()
                .collect(Collectors.groupingBy(
                        Batch::getCropType,
                        Collectors.counting()
                ));

        // Calculate average quality by crop
        Map<String, Double> avgQualityByCrop = new HashMap<>();
        for (String crop : cropsCount.keySet()) {
            double avgQuality = allBatches.stream()
                    .filter(b -> b.getCropType().equals(crop))
                    .mapToDouble(b -> b.getQualityScore() != null ? b.getQualityScore() : 0)
                    .average()
                    .orElse(0.0);
            avgQualityByCrop.put(crop, avgQuality);
        }

        return Map.of(
                "cropBreakdown", cropsCount,
                "averageQualityByCrop", avgQualityByCrop
        );
    }

    /**
     * Get supply chain completion metrics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSupplyChainMetrics() {
        List<SupplyChainEvent> allEvents = supplyChainEventRepository.findAll();

        // Count by stage
        Map<String, Long> eventsByStage = allEvents.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getStage().toString(),
                        Collectors.counting()
                ));

        // Average completion percentage
        List<Batch> allBatches = batchRepository.findAll();
        double avgCompletion = allBatches.stream()
                .mapToDouble(b -> {
                    long eventCount = allEvents.stream()
                            .filter(e -> e.getBatchId().equals(b.getId()))
                            .count();
                    return (eventCount / 7.0) * 100; // Max 7 stages
                })
                .average()
                .orElse(0.0);

        return Map.of(
                "eventsByStage", eventsByStage,
                "averageCompletionPercentage", String.format("%.2f", avgCompletion),
                "totalBatchesCompleted", allBatches.stream()
                        .filter(b -> b.getStatus() == Batch.BatchStatus.DELIVERED).count()
        );
    }

    /**
     * Get user activity metrics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivityMetrics() {
        List<User> allUsers = userRepository.findAll();

        Map<String, Integer> activeUsersByRole = new HashMap<>();
        for (User.UserRole role : User.UserRole.values()) {
            List<User> users = userRepository.findByRole(role);
            activeUsersByRole.put(role.name(), users.size());
        }

        return Map.of(
                "totalActiveUsers", allUsers.size(),
                "usersByRole", activeUsersByRole
        );
    }

    /**
     * Get review analytics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getReviewAnalytics() {
        List<Review> allReviews = reviewRepository.findAll();

        double avgRating = allReviews.stream()
                .mapToDouble(r -> r.getRating() != null ? r.getRating() : 0)
                .average()
                .orElse(0.0);

        Map<Integer, Long> ratingDistribution = allReviews.stream()
                .collect(Collectors.groupingBy(
                        Review::getRating,
                        Collectors.counting()
                ));

        return Map.of(
                "totalReviews", allReviews.size(),
                "averageRating", String.format("%.2f", avgRating),
                "ratingDistribution", ratingDistribution
        );
    }

    /**
     * Get time-based analytics (monthly statistics)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMonthlyAnalytics() {
        List<Batch> allBatches = batchRepository.findAll();
        
        // Group by month
        Map<YearMonth, Long> batchesByMonth = allBatches.stream()
                .filter(b -> b.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        b -> YearMonth.from(b.getCreatedAt()),
                        Collectors.counting()
                ));

        List<Batch> soldBatches = allBatches.stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.DELIVERED)
                .collect(Collectors.toList());

        Map<YearMonth, Long> soldByMonth = soldBatches.stream()
                .filter(b -> b.getUpdatedAt() != null)
                .collect(Collectors.groupingBy(
                        b -> YearMonth.from(b.getUpdatedAt()),
                        Collectors.counting()
                ));

        return Map.of(
                "batchesCreatedByMonth", batchesByMonth,
                "batchesSoldByMonth", soldByMonth
        );
    }

    /**
     * Get quality trend analysis
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getQualityTrendAnalytics() {
        List<Batch> allBatches = batchRepository.findAll();

        List<Batch> recentBatches = allBatches.stream()
                .filter(b -> b.getQualityScore() != null)
                .sorted(Comparator.comparing(Batch::getCreatedAt).reversed())
                .limit(50)
                .collect(Collectors.toList());

        List<Map<String, Object>> trendData = recentBatches.stream()
                .map(b -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("batchId", b.getId());
                    data.put("cropType", b.getCropType());
                    data.put("qualityScore", b.getQualityScore());
                    data.put("date", b.getCreatedAt().toString());
                    return data;
                })
                .collect(Collectors.toList());

        double avgQuality = recentBatches.stream()
                .mapToDouble(b -> b.getQualityScore())
                .average()
                .orElse(0.0);

        return Map.of(
                "trendData", trendData,
                "averageQuality", String.format("%.2f", avgQuality)
        );
    }

    /**
     * Get system health report
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSystemHealthReport() {
        List<Batch> allBatches = batchRepository.findAll();
        long totalBatches = allBatches.size();

        long activeBatches = allBatches.stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.QUALITY_PASSED || 
                           b.getStatus() == Batch.BatchStatus.RECEIVED_BY_DIST)
                .count();

        long pendingBatches = allBatches.stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.AVAILABLE)
                .count();

        long completedBatches = allBatches.stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.DELIVERED)
                .count();

        long rejectedBatches = allBatches.stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.REJECTED_BY_DIST)
                .count();

        double completionRate = totalBatches > 0 ? (completedBatches * 100.0) / totalBatches : 0;

        return Map.of(
                "status", "HEALTHY",
                "totalBatches", totalBatches,
                "activeBatches", activeBatches,
                "pendingQCBatches", pendingBatches,
                "completedBatches", completedBatches,
                "rejectedBatches", rejectedBatches,
                "completionRate", String.format("%.2f", completionRate) + "%"
        );
    }
}
