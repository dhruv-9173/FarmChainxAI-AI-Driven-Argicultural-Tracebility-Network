package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributorAnalyticsDto {

    private String month;
    private Integer received;
    private Integer transferred;
    private Integer rejected;
}
