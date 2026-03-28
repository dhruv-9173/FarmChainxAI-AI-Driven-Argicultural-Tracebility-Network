package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerListingDto {

    private String id;
    private String name;
    private String farmName;
    private String location;
    private String state;
    private String phone;
    private String email;
    private String specialization;
    private Double rating;
    private Integer totalBatchesSent;
    private Integer activeBatches;
    private Boolean organic;
    private String joinedDate;
    private List<FarmerBatchListingDto> availableBatches;
}
