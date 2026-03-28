package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumerReceiptRequest {
    private String purchaseDate;
    private String retailerName;
    private Double purchasePrice;
    private String storeName;
}