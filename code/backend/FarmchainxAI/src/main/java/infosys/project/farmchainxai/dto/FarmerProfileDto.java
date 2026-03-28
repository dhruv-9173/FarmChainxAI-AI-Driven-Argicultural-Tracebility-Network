package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * FarmerProfileDto - Data Transfer Object for farmer's basic information
 * Contains user profile and farm overview information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerProfileDto {

    // ============ USER INFORMATION ============
    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("farmerId")
    private Long farmerId;

    @JsonProperty("fullName")
    private String fullName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("role")
    private String role;

    @JsonProperty("memberSince")
    private String memberSince;

    // ============ FARM BASIC INFORMATION ============
    @JsonProperty("farmId")
    private String farmId;

    @JsonProperty("farmName")
    private String farmName;

    @JsonProperty("farmCity")
    private String farmCity;

    @JsonProperty("farmState")
    private String farmState;

    @JsonProperty("location")
    private String farmLocation;

    @JsonProperty("farmSize")
    private BigDecimal farmSize;

    // ============ PRIMARY AGRICULTURE INFO ============
    @JsonProperty("primaryCrops")
    private String primaryCrops;

    @JsonProperty("soilType")
    private String soilType;

    @JsonProperty("irrigationMethod")
    private String irrigationMethod;

    @JsonProperty("irrigationType")
    private String irrigationType;

    // ============ PROFILE & VERIFICATION ============
    @JsonProperty("verified")
    private Boolean verified;

    @JsonProperty("rating")
    private BigDecimal rating;

    @JsonProperty("profileImageUrl")
    private String profileImageUrl;

    @JsonProperty("profileImageBase64")
    private String profileImageBase64;

    // ============ FARM DETAILS ============
    @JsonProperty("farmDetails")
    private FarmDetailsDto farmDetails;
}
