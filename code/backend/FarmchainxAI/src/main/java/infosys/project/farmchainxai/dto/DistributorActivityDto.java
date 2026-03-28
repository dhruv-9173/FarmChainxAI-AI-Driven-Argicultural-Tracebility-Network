package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributorActivityDto {

    private String id;
    private String title;
    private String description;
    private String time;
    private String badge;
    private String badgeColor;
}
