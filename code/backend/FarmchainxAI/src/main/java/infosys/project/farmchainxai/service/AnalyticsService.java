package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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

    /**
     * Farmer-facing baseline predictive analytics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getFarmerPredictiveInsights() {
        List<Batch> allBatches = batchRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        List<Batch> qualitySamples = allBatches.stream()
                .filter(b -> b.getQualityScore() != null && b.getCreatedAt() != null)
                .sorted(Comparator.comparing(Batch::getCreatedAt))
                .collect(Collectors.toList());

        List<Map<String, Object>> qualityForecast = new ArrayList<>();
        int qualityLookback = Math.min(6, qualitySamples.size());
        if (qualityLookback > 0) {
            List<Batch> recent = qualitySamples.subList(qualitySamples.size() - qualityLookback, qualitySamples.size());
            double avgQuality = recent.stream().mapToInt(Batch::getQualityScore).average().orElse(0);
            double slope = computeSimpleSlope(recent.stream().map(Batch::getQualityScore).collect(Collectors.toList()));

            for (int i = 0; i < recent.size(); i++) {
                Batch b = recent.get(i);
                double predicted = clamp(avgQuality + slope * (i + 1), 0, 100);
                qualityForecast.add(Map.of(
                        "label", b.getCreatedAt().toLocalDate().toString(),
                        "actual", b.getQualityScore(),
                        "predicted", round2(predicted)
                ));
            }
        }

        long highRiskBatches = allBatches.stream()
                .filter(b -> b.getCurrentShelfLifeDays() != null && b.getCurrentShelfLifeDays() <= 2)
                .count();

        double avgRemainingShelfLife = allBatches.stream()
                .filter(b -> b.getCurrentShelfLifeDays() != null)
                .mapToInt(Batch::getCurrentShelfLifeDays)
                .average()
                .orElse(0);

        String shelfLifeRiskLevel;
        if (highRiskBatches >= 20) {
            shelfLifeRiskLevel = "HIGH";
        } else if (highRiskBatches >= 8) {
            shelfLifeRiskLevel = "MEDIUM";
        } else {
            shelfLifeRiskLevel = "LOW";
        }

        Map<String, Object> shelfLifeRisk = Map.of(
                "highRiskBatches", highRiskBatches,
                "avgRemainingShelfLifeDays", round2(avgRemainingShelfLife),
                "riskLevel", shelfLifeRiskLevel,
                "confidence", 0.72
        );

        Map<YearMonth, Long> createdByMonth = allBatches.stream()
                .filter(b -> b.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        b -> YearMonth.from(b.getCreatedAt()),
                        TreeMap::new,
                        Collectors.counting()
                ));

        List<Map<String, Object>> demandTrend = new ArrayList<>();
        List<Long> demandSeries = new ArrayList<>(createdByMonth.values());
        double baselineDemand = demandSeries.stream().mapToLong(v -> v).average().orElse(0);
        double demandSlope = computeSimpleSlope(demandSeries);

        int idx = 1;
        for (Map.Entry<YearMonth, Long> entry : createdByMonth.entrySet()) {
            double forecast = Math.max(0, baselineDemand + (demandSlope * idx));
            demandTrend.add(Map.of(
                    "month", entry.getKey().toString(),
                    "actual", entry.getValue(),
                    "forecast", round2(forecast)
            ));
            idx++;
        }

        for (int i = 1; i <= 3; i++) {
            YearMonth next = YearMonth.now().plusMonths(i);
            double forecast = Math.max(0, baselineDemand + (demandSlope * (demandTrend.size() + i)));
            demandTrend.add(Map.of(
                    "month", next.toString(),
                    "actual", 0,
                    "forecast", round2(forecast)
            ));
        }

        return Map.of(
                "qualityForecast", qualityForecast,
                "shelfLifeRisk", shelfLifeRisk,
                "demandTrend", demandTrend,
                "modelVersion", "baseline-regression-v1",
                "generatedAt", now.toString(),
                "confidence", 0.74
        );
    }

    /**
     * Distributor-facing baseline predictive analytics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDistributorPredictiveInsights() {
        List<Batch> allBatches = batchRepository.findAll();
        List<SupplyChainEvent> allEvents = supplyChainEventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        Map<String, List<SupplyChainEvent>> eventsByBatch = allEvents.stream()
                .filter(e -> e.getBatchId() != null && e.getTimestamp() != null)
                .collect(Collectors.groupingBy(SupplyChainEvent::getBatchId));

        List<Long> transitHours = new ArrayList<>();
        for (List<SupplyChainEvent> batchEvents : eventsByBatch.values()) {
            Optional<LocalDateTime> inTransitAt = batchEvents.stream()
                    .filter(e -> e.getStage() == SupplyChainEvent.SupplyChainStage.IN_TRANSIT)
                    .map(SupplyChainEvent::getTimestamp)
                    .min(LocalDateTime::compareTo);
            Optional<LocalDateTime> receivedAt = batchEvents.stream()
                    .filter(e -> e.getStage() == SupplyChainEvent.SupplyChainStage.RECEIVED)
                    .map(SupplyChainEvent::getTimestamp)
                    .min(LocalDateTime::compareTo);

            if (inTransitAt.isPresent() && receivedAt.isPresent() && !receivedAt.get().isBefore(inTransitAt.get())) {
                transitHours.add(ChronoUnit.HOURS.between(inTransitAt.get(), receivedAt.get()));
            }
        }

        double avgTransitHours = transitHours.stream().mapToLong(v -> v).average().orElse(0);
        long delayedTransfers = transitHours.stream().filter(h -> h > 24).count();
        double lateProbability = transitHours.isEmpty() ? 0 : (delayedTransfers * 100.0) / transitHours.size();
        String delayRisk = lateProbability >= 40 ? "HIGH" : lateProbability >= 20 ? "MEDIUM" : "LOW";

        Map<String, Object> transferDelayRisk = Map.of(
                "avgTransitHours", round2(avgTransitHours),
                "lateTransferProbabilityPct", round2(lateProbability),
                "riskLevel", delayRisk,
                "recommendedBufferHours", Math.max(6, Math.round(avgTransitHours * 0.25)),
                "confidence", 0.7
        );

        List<Integer> qualitySeries = allBatches.stream()
                .filter(b -> b.getQualityScore() != null)
                .sorted(Comparator.comparing(Batch::getUpdatedAt, Comparator.nullsLast(LocalDateTime::compareTo)))
                .map(Batch::getQualityScore)
                .collect(Collectors.toList());

        double qualityBaseline = qualitySeries.stream().mapToInt(v -> v).average().orElse(0);
        double qualitySlope = computeSimpleSlope(qualitySeries);
        double nextWeekQuality = clamp(qualityBaseline + (qualitySlope * 1.5), 0, 100);
        double nextMonthQuality = clamp(qualityBaseline + (qualitySlope * 4.0), 0, 100);

        Map<String, Object> qualityDeclineForecast = Map.of(
                "currentAvgQuality", round2(qualityBaseline),
                "predictedQualityNext7Days", round2(nextWeekQuality),
                "predictedQualityNext30Days", round2(nextMonthQuality),
                "trend", qualitySlope < -0.25 ? "DECLINING" : qualitySlope > 0.25 ? "IMPROVING" : "STABLE"
        );

        Map<YearMonth, Long> demandByMonth = allEvents.stream()
                .filter(e -> e.getStage() == SupplyChainEvent.SupplyChainStage.RECEIVED && e.getTimestamp() != null)
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getTimestamp()),
                        TreeMap::new,
                        Collectors.counting()
                ));

        List<Map<String, Object>> demandTrend = new ArrayList<>();
        List<Long> demandSeries = new ArrayList<>(demandByMonth.values());
        double demandBaseline = demandSeries.stream().mapToLong(v -> v).average().orElse(0);
        double demandSlope = computeSimpleSlope(demandSeries);

        int idx = 1;
        for (Map.Entry<YearMonth, Long> entry : demandByMonth.entrySet()) {
            double forecast = Math.max(0, demandBaseline + (demandSlope * idx));
            demandTrend.add(Map.of(
                    "month", entry.getKey().toString(),
                    "actual", entry.getValue(),
                    "forecast", round2(forecast)
            ));
            idx++;
        }

        for (int i = 1; i <= 3; i++) {
            YearMonth next = YearMonth.now().plusMonths(i);
            double forecast = Math.max(0, demandBaseline + (demandSlope * (demandTrend.size() + i)));
            demandTrend.add(Map.of(
                    "month", next.toString(),
                    "actual", 0,
                    "forecast", round2(forecast)
            ));
        }

        return Map.of(
                "transferDelayRisk", transferDelayRisk,
                "qualityDeclineForecast", qualityDeclineForecast,
                "demandTrend", demandTrend,
                "modelVersion", "baseline-regression-v1",
                "generatedAt", now.toString(),
                "confidence", 0.71
        );
    }

    private double computeSimpleSlope(List<? extends Number> values) {
        if (values == null || values.size() < 2) {
            return 0;
        }

        int n = values.size();
        double xMean = (n - 1) / 2.0;
        double yMean = values.stream().mapToDouble(Number::doubleValue).average().orElse(0);

        double numerator = 0;
        double denominator = 0;
        for (int i = 0; i < n; i++) {
            double x = i - xMean;
            double y = values.get(i).doubleValue() - yMean;
            numerator += x * y;
            denominator += x * x;
        }

        return denominator == 0 ? 0 : numerator / denominator;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
