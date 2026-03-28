package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InitiateQCRequest {
    private Double moistureLevel;
    private Integer temperature;
    private Double phLevel;
    private String color;
    private String texture;
    private String smell;
    private Boolean pestInfestation;
    private Boolean moldPresence;
    private Boolean foreignMatter;
    private String notes;
}