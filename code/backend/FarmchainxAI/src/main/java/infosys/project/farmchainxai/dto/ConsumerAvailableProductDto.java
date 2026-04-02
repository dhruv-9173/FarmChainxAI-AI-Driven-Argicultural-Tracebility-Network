package infosys.project.farmchainxai.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ConsumerAvailableProductDto {
    private String id;
    private String cropType;
    private String variety;
    private String cropImageUrl;
    private BigDecimal quantity;
    private String quantityUnit;
    private BigDecimal pricePerUnit;
    private Integer qualityScore;
    private String status;

    private String retailerName;
    private String retailerShopName;
    private String retailerPhone;
    private String retailerEmail;
    private String retailerAddress;
    private String retailerCity;
    private String retailerState;
}
