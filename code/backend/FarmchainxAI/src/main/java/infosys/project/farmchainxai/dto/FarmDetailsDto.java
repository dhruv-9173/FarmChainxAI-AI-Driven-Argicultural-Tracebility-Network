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
public class FarmDetailsDto {

    private Long id;
    private String farmId;
    private String farmName;
    private String farmLocation;
    private BigDecimal farmSize;
    private String primaryCrops;
    private String soilType;
    private String irrigationType;
}
