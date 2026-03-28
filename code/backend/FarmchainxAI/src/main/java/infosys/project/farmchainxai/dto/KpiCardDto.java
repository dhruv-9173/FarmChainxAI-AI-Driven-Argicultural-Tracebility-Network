package infosys.project.farmchainxai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class KpiCardDto {

    @JsonProperty("title")
    private String title;

    @JsonProperty("value")
    private String value;

    @JsonProperty("subtitle")
    private String subtitle;

    @JsonProperty("icon")
    private String icon;

    @JsonProperty("color")
    private String color;       // hex color, e.g. "#166534"

    @JsonProperty("trend")
    private String trend;       // UP, DOWN, STABLE

    @JsonProperty("trendValue")
    private String trendValue;

    public KpiCardDto(String title, String value, String subtitle,
                      String icon, String color, String trend, String trendValue) {
        this.title      = title;
        this.value      = value;
        this.subtitle   = subtitle;
        this.icon       = icon;
        this.color      = color;
        this.trend      = trend;
        this.trendValue = trendValue;
    }
}

