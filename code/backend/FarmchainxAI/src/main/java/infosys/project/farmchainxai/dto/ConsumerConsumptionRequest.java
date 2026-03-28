package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumerConsumptionRequest {
    private String consumptionDate;
    private Integer rating; // 1-5 stars
    private Boolean satisfied;
    private String notes;
}