package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipientDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("type")
    private String type;

    @JsonProperty("city")
    private String city;

    @JsonProperty("state")
    private String state;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("rating")
    private Double rating;

    @JsonProperty("batchesReceived")
    private Integer batchesReceived;

    @JsonProperty("specialty")
    private String specialty;

    @JsonProperty("verified")
    private Boolean verified;
}
