package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributorProfileDto {

    // User info
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String memberSince;
    private String distributorId;
    private String avatarUrl;

    // Business info
    private String companyName;
    private String companyId;
    private String warehouseLocation;
    private String gstNumber;
    private String licenseNumber;
    private String operationalArea;
    private String warehouseCapacity;
    private String establishedYear;
    private BigDecimal rating;
}
