package infosys.project.farmchainxai.dto;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BatchDto {

    // Core identifiers
    private String id;
    private Long farmerId;

    // Crop info
    private String cropType;
    private String variety;
    private BigDecimal quantity;
    private String quantityUnit;
    private BigDecimal pricePerUnit;
    private Integer qualityScore;
    private String qualityGrade;
    private String status;

    // Farm location
    private String farmCity;
    private String farmState;

    // Storage & farming details
    private String storageType;
    private String storageLocation;
    private String soilType;
    private String irrigationType;

    // Quality & shelf life
    private Integer expectedShelfLifeDays;
    private Integer currentShelfLifeDays;
    private BigDecimal moistureLevel;
    private Boolean organic;
    private Boolean gapCertified;
    private String certifications;


    // Dates
    private LocalDate sowingDate;
    private LocalDate harvestDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Notes
    private String notes;

    // Crop image payload (URL or base64 data URI)
    private String cropImageUrl;

    // ── QR Code Fields ──────────────────────────────────────────────────────
    /** The full traceability URL encoded inside the QR (e.g. https://trace.farmchain.ai/batch/BCH-xxx) */
    private String qrCodeUrl;

    /** Base64-encoded PNG: "data:image/png;base64,..." — send directly to <img src="..."> */
    private String qrCodeBase64;
    // ────────────────────────────────────────────────────────────────────────
}