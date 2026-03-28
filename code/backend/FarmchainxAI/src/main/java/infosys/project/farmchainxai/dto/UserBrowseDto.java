package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for displaying user profile information during browsing.
 * Includes basic user info, ratings, batch statistics, and batch list.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBrowseDto {

    // ═══ Basic User Information ═══
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String role; // FARMER, DISTRIBUTOR, RETAILER
    private String profileImageUrl;

    // ═══ Role-Specific Information ═══
    // Farmer-specific
    private String farmId;
    private String farmName;
    private String location;
    private BigDecimal farmSize;
    private String primaryCrops;
    private String soilType;
    private Boolean farmVerified;

    // Distributor-specific
    private String businessName;
    private String businessRegistration;

    // ═══ Ratings and Statistics ═══
    private BigDecimal rating;
    private Integer totalBatches;
    private Integer activeBatches;
    private Integer completedBatches;

    // ═══ Batch Information ═══
    private List<UserBatchSummaryDto> batches;

    // ═══ Metadata ═══
    private String createdAt;
    private String verificationStatus;
}
