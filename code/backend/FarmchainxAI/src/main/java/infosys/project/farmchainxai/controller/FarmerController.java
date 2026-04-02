package infosys.project.farmchainxai.controller;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.service.FarmerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/farmer")
public class FarmerController {

    @Autowired
    private FarmerService farmerService;

    // Profile Endpoints
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<FarmerProfileDto>> getFarmerProfile(Authentication authentication) {
        try {
            String userId = authentication.getName();
            FarmerProfileDto profile = farmerService.getFarmerProfile(userId);
            return ResponseEntity.ok(new ApiResponse<>("Profile retrieved successfully", profile, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Failed to retrieve profile: " + e.getMessage(), null, false));
        }
    }

    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<FarmerProfileDto>> updateFarmerProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateFarmerProfileRequest request) {
        try {
            String userId = authentication.getName();
            FarmerProfileDto updated = farmerService.updateFarmerProfile(userId, request);
            return ResponseEntity.ok(new ApiResponse<>("Profile updated successfully", updated, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to update profile: " + e.getMessage(), null, false));
        }
    }

    // Farm Details Endpoints
    @GetMapping("/farm-details")
    public ResponseEntity<ApiResponse<FarmDetailsDto>> getFarmDetails(Authentication authentication) {
        try {
            String userId = authentication.getName();
            FarmDetailsDto farmDetails = farmerService.getFarmDetails(userId);
            return ResponseEntity.ok(new ApiResponse<>("Farm details retrieved successfully", farmDetails, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Failed to retrieve farm details: " + e.getMessage(), null, false));
        }
    }

    @PatchMapping("/farm-details")
    public ResponseEntity<ApiResponse<FarmDetailsDto>> updateFarmDetails(
            Authentication authentication,
            @Valid @RequestBody UpdateFarmDetailsRequest request) {
        try {
            String userId = authentication.getName();
            FarmDetailsDto updated = farmerService.updateFarmDetails(userId, request);
            return ResponseEntity.ok(new ApiResponse<>("Farm details updated successfully", updated, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to update farm details: " + e.getMessage(), null, false));
        }
    }

    @PostMapping("/profile/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            String userId = authentication.getName();
            farmerService.changePassword(userId, request);
            return ResponseEntity.ok(new ApiResponse<>("Password changed successfully", null, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    // KPI Endpoints
    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<List<KpiCardDto>>> getKpis(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<KpiCardDto> kpis = farmerService.getKpis(userId);
            return ResponseEntity.ok(new ApiResponse<>("KPIs retrieved successfully", kpis, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve KPIs: " + e.getMessage(), null, false));
        }
    }

    // Batch Endpoints
    @GetMapping("/batches")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBatches(
            Authentication authentication,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int limit,
            @RequestParam(name = "status", required = false) String status) {
        try {
            String userId = authentication.getName();
            Pageable pageable = PageRequest.of(page, limit);

            Page<BatchDto> batches;
            if (status != null && !status.isEmpty()) {
                batches = farmerService.getBatchesByStatus(userId, status, pageable);
            } else {
                batches = farmerService.getBatches(userId, pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("content", batches.getContent());
            response.put("totalElements", batches.getTotalElements());
            response.put("totalPages", batches.getTotalPages());
            response.put("currentPage", page);

            return ResponseEntity.ok(new ApiResponse<>("Batches retrieved successfully", response, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve batches: " + e.getMessage(), null, false));
        }
    }


    @GetMapping("/batches/pending")
    public ResponseEntity<ApiResponse<List<BatchDto>>> getActiveBatches(
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            
            // Get all batches with ACTIVE status only (no pagination)
            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            Page<BatchDto> activeBatchesPage = farmerService.getBatchesByStatus(userId, "PENDING", pageable);
            
            List<BatchDto> activeBatches = activeBatchesPage.getContent();

            return ResponseEntity.ok(new ApiResponse<>(
                    "Pending batches retrieved successfully",
                    activeBatches,
                    true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to retrieve pending batches: " + e.getMessage(),
                            null,
                            false
                    ));
        }
    }

    @GetMapping("/batches/{id}")
    public ResponseEntity<ApiResponse<BatchDto>> getBatchById(@PathVariable String id) {
        try {
            BatchDto batch = farmerService.getBatchById(id);
            return ResponseEntity.ok(new ApiResponse<>("Batch retrieved successfully", batch, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Batch not found: " + e.getMessage(), null, false));
        }
    }

    @PatchMapping("/batches/{id}/harvest")
    public ResponseEntity<ApiResponse<BatchDto>> markBatchAsHarvested(
            Authentication authentication,
            @PathVariable String id) {
        try {
            String userId = authentication.getName();
            BatchDto updated = farmerService.markBatchAsHarvested(userId, id);
            return ResponseEntity.ok(new ApiResponse<>("Batch marked as harvested", updated, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to mark batch as harvested: " + e.getMessage(), null, false));
        }
    }

    @PostMapping("/batches")
    public ResponseEntity<ApiResponse<BatchDto>> createBatch(
            Authentication authentication,
            @Valid @RequestBody CreateBatchRequest request) {
        try {
            String userId = authentication.getName();
            BatchDto batch = farmerService.createBatch(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Batch created successfully", batch, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Failed to create batch: " + e.getMessage(), null, false));
        }
    }


    // ✅ TRANSFER ENDPOINTS REMOVED
    // See: BatchTransferController (/api/v1/transfers)
    // Endpoints:
    //   GET  /api/v1/transfers/recipients?role=DISTRIBUTOR
    //   GET  /api/v1/transfers/search?role=DISTRIBUTOR&query=john
    //   POST /api/v1/transfers/initiate
    //   POST /api/v1/transfers/{transferId}/accept
    //   POST /api/v1/transfers/{transferId}/reject
    //   DELETE /api/v1/transfers/{transferId}


    // Activity Endpoints
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<ActivityItemDto>>> getActivities(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<ActivityItemDto> activities = farmerService.getActivities(userId);
            return ResponseEntity.ok(new ApiResponse<>("Activities retrieved successfully", activities, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve activities: " + e.getMessage(), null, false));
        }
    }

    // Quality Trends Endpoints
    @GetMapping("/quality-trends")
    public ResponseEntity<ApiResponse<List<QualityTrendPointDto>>> getQualityTrends(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<QualityTrendPointDto> trends = farmerService.getQualityTrends(userId);
            return ResponseEntity.ok(new ApiResponse<>("Quality trends retrieved successfully", trends, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve quality trends: " + e.getMessage(), null, false));
        }
    }

    // Shelf Life Endpoints
    @GetMapping("/shelf-life")
    public ResponseEntity<ApiResponse<List<ShelfLifeItemDto>>> getShelfLife(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<ShelfLifeItemDto> shelfLife = farmerService.getShelfLife(userId);
            return ResponseEntity.ok(new ApiResponse<>("Shelf life data retrieved successfully", shelfLife, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve shelf life data: " + e.getMessage(), null, false));
        }
    }

    // Recipients Endpoint
    @GetMapping("/recipients")
    public ResponseEntity<ApiResponse<List<RecipientDto>>> getRecipients(Authentication authentication) {
        try {
            List<RecipientDto> recipients = farmerService.getRecipients();
            return ResponseEntity.ok(new ApiResponse<>("Recipients retrieved successfully", recipients, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve recipients: " + e.getMessage(), null, false));
        }
    }
}

