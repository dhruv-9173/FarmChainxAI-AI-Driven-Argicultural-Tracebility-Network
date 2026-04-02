package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerAnalyticsPointDto {
    private String month;
    private int received;
    private int sold;
    private int expired;
    private double revenue;
}
