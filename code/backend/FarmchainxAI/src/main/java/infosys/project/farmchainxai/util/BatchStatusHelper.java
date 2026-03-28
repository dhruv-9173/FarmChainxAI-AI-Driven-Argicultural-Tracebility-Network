package infosys.project.farmchainxai.util;

import infosys.project.farmchainxai.entity.Batch;
import infosys.project.farmchainxai.entity.User;

import java.util.*;

/**
 * ✅ BATCH STATUS HELPER - Unified State Machine Logic
 *
 * Handles all batch status transitions with auto-accept model:
 * - No PENDING/IN_TRANSIT states - batches auto-transition to RECEIVED when transfer accepted
 * - Role-based transition validation
 * - Visible statuses per role
 * - State machine enforcement
 */
public class BatchStatusHelper {

    /**
     * Get the auto-accept status based on recipient role
     * When a batch transfer is ACCEPTED, it automatically transitions to the appropriate status
     *
     * @param recipientRole The role accepting the transfer
     * @return The auto-assigned batch status
     */
    public static Batch.BatchStatus getAutoAcceptStatus(String recipientRole) {
        return switch (recipientRole) {
            case "DISTRIBUTOR" -> Batch.BatchStatus.RECEIVED_BY_DIST;
            case "RETAILER" -> Batch.BatchStatus.RECEIVED_BY_RETAIL;
            case "CONSUMER" -> Batch.BatchStatus.DELIVERED;
            default -> throw new IllegalArgumentException("Unknown recipient role: " + recipientRole);
        };
    }

    /**
     * Get the auto-accept status based on user role enum
     *
     * @param role The User.UserRole enum
     * @return The auto-assigned batch status
     */
    public static Batch.BatchStatus getAutoAcceptStatus(User.UserRole role) {
        return getAutoAcceptStatus(role.name());
    }

    /**
     * Validate if a batch status transition is allowed
     * Enforces the state machine rules
     *
     * @param currentStatus The current batch status
     * @param newStatus The desired new status
     * @param userRole The role making the change
     * @return true if transition is valid
     * @throws IllegalStateException if transition is invalid
     */
    public static boolean isValidTransition(Batch.BatchStatus currentStatus, Batch.BatchStatus newStatus, String userRole) {
        // Same status, no transition
        if (currentStatus == newStatus) {
            return true;
        }

        // Define valid transitions by current status and user role
        Map<Batch.BatchStatus, Set<String>> validNextStates = getValidNextStatuses(currentStatus, userRole);

        if (!validNextStates.containsKey(newStatus)) {
            throw new IllegalStateException(
                    String.format("Invalid transition: %s -> %s for role %s",
                            currentStatus, newStatus, userRole)
            );
        }

        return true;
    }

    /**
     * Get all valid next states for a given current status and role
     *
     * @param currentStatus Current batch status
     * @param userRole Role making the transition
     * @return Map of valid next statuses
     */
    public static Map<Batch.BatchStatus, Set<String>> getValidNextStatuses(Batch.BatchStatus currentStatus, String userRole) {
        Map<Batch.BatchStatus, Set<String>> transitions = new HashMap<>();

        // Farmer-level transitions
        if ("FARMER".equals(userRole)) {
            transitions.put(Batch.BatchStatus.CREATED, Set.of("HARVESTED", "REJECTED_BY_FARMER"));
            transitions.put(Batch.BatchStatus.HARVESTED, Set.of("REJECTED_BY_FARMER")); // Once harvested, transfer decision is next
        }

        // Distributor-level transitions
        if ("DISTRIBUTOR".equals(userRole)) {
            transitions.put(Batch.BatchStatus.RECEIVED_BY_DIST, Set.of("QUALITY_PASSED", "REJECTED_BY_DIST"));
            transitions.put(Batch.BatchStatus.QUALITY_PASSED, Set.of("RECEIVED_BY_RETAIL"));  // Move to retailer when transfer accepted
            transitions.put(Batch.BatchStatus.REJECTED_BY_DIST, Set.of("DISCARDED"));
        }

        // Retailer-level transitions
        if ("RETAILER".equals(userRole)) {
            transitions.put(Batch.BatchStatus.RECEIVED_BY_RETAIL, Set.of("AVAILABLE", "REJECTED_BY_RETAIL"));
            transitions.put(Batch.BatchStatus.AVAILABLE, Set.of("LOW_STOCK", "DELIVERED", "EXPIRED"));
            transitions.put(Batch.BatchStatus.LOW_STOCK, Set.of("AVAILABLE", "DELIVERED", "EXPIRED"));
            transitions.put(Batch.BatchStatus.REJECTED_BY_RETAIL, Set.of("DISCARDED"));
        }

        // Consumer-level transitions
        if ("CONSUMER".equals(userRole)) {
            transitions.put(Batch.BatchStatus.DELIVERED, Set.of("CONSUMED", "EXPIRED"));
        }

        return transitions;
    }

    /**
     * Get all batch statuses visible to a specific role
     *
     * @param userRole The user's role
     * @return Set of visible statuses
     */
    public static Set<Batch.BatchStatus> getVisibleStatusesForRole(String userRole) {
        return switch (userRole) {
            case "FARMER" -> Set.of(
                    Batch.BatchStatus.CREATED,
                    Batch.BatchStatus.HARVESTED,
                    Batch.BatchStatus.REJECTED_BY_FARMER
            );

            case "DISTRIBUTOR" -> Set.of(
                    Batch.BatchStatus.RECEIVED_BY_DIST,
                    Batch.BatchStatus.QUALITY_PASSED,
                    Batch.BatchStatus.REJECTED_BY_DIST,
                    Batch.BatchStatus.RECEIVED_BY_RETAIL
            );

            case "RETAILER" -> Set.of(
                    Batch.BatchStatus.RECEIVED_BY_RETAIL,
                    Batch.BatchStatus.AVAILABLE,
                    Batch.BatchStatus.LOW_STOCK,
                    Batch.BatchStatus.REJECTED_BY_RETAIL,
                    Batch.BatchStatus.DELIVERED,
                    Batch.BatchStatus.EXPIRED
            );

            case "CONSUMER" -> Set.of(
                    Batch.BatchStatus.DELIVERED,
                    Batch.BatchStatus.CONSUMED,
                    Batch.BatchStatus.EXPIRED
            );

            case "ADMIN" -> Set.of(Batch.BatchStatus.values()); // Admin sees all

            default -> Collections.emptySet();
        };
    }

    /**
     * Get the initial status when a batch is created
     *
     * @return CREATED status
     */
    public static Batch.BatchStatus getInitialStatus() {
        return Batch.BatchStatus.CREATED;
    }

    /**
     * Check if a status is a terminal state (end of lifecycle)
     *
     * @param status The status to check
     * @return true if terminal
     */
    public static boolean isTerminalStatus(Batch.BatchStatus status) {
        return Set.of(
                Batch.BatchStatus.CONSUMED,
                Batch.BatchStatus.EXPIRED,
                Batch.BatchStatus.DISCARDED,
                Batch.BatchStatus.REJECTED_BY_FARMER,
                Batch.BatchStatus.REJECTED_BY_DIST,
                Batch.BatchStatus.REJECTED_BY_RETAIL
        ).contains(status);
    }

    /**
     * Get human-readable status label
     *
     * @param status The batch status
     * @return Display label
     */
    public static String getStatusLabel(Batch.BatchStatus status) {
        return switch (status) {
            case CREATED -> "Created";
            case HARVESTED -> "Harvested";
            case REJECTED_BY_FARMER -> "Rejected by Farmer";
            case RECEIVED_BY_DIST -> "Received by Distributor";
            case QUALITY_PASSED -> "Quality Passed";
            case REJECTED_BY_DIST -> "Rejected by Distributor";
            case RECEIVED_BY_RETAIL -> "Received by Retailer";
            case AVAILABLE -> "Available for Sale";
            case LOW_STOCK -> "Low Stock";
            case REJECTED_BY_RETAIL -> "Rejected by Retailer";
            case DELIVERED -> "Delivered";
            case CONSUMED -> "Consumed";
            case EXPIRED -> "Expired";
            case DISCARDED -> "Discarded";
        };
    }

    /**
     * Get status color for UI display
     *
     * @param status The batch status
     * @return CSS color value
     */
    public static String getStatusColor(Batch.BatchStatus status) {
        return switch (status) {
            case CREATED, HARVESTED -> "#FFA500"; // Orange - pending
            case RECEIVED_BY_DIST, RECEIVED_BY_RETAIL, DELIVERED -> "#4CAF50"; // Green - received/active
            case QUALITY_PASSED, AVAILABLE -> "#2196F3"; // Blue - good state
            case LOW_STOCK -> "#FF9800"; // Amber - warning
            case CONSUMED -> "#8BC34A"; // Light green - completed
            case EXPIRED, REJECTED_BY_FARMER, REJECTED_BY_DIST, REJECTED_BY_RETAIL, DISCARDED -> "#F44336"; // Red - failure
        };
    }
}
