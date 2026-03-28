package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String storeLocation;
    private String storeCity;
    private String storeState;
}
