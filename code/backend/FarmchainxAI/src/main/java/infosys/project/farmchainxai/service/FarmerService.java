package infosys.project.farmchainxai.service;


import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FarmerService {

    @Autowired
    private FarmerProfileRepository farmerProfileRepository;

    @Autowired
    private FarmDetailsRepository farmDetailsRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private QrCodeService qrCodeService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SupplyChainService supplyChainService;

    // Batch Methods
    @Transactional
    public BatchDto createBatch(String email, CreateBatchRequest request) {
        Long userId = getUserIdFromEmail(email);
        String batchId = "BCH-" + System.currentTimeMillis();

        // Generate QR code for the batch
        QrCodeService.QrCodeResult qrResult = qrCodeService.generateBatchQrCode(batchId);

        Batch batch = Batch.builder()
                .id(batchId)
                .farmerId(userId)
                .cropType(request.getCropType())
                .variety(request.getCropVariety())
                .quantity(request.getQuantity())
                .quantityUnit(Batch.QuantityUnit.valueOf(request.getQuantityUnit()))
                .qualityGrade(request.getQualityGrade())
                .qualityScore(request.getInitialQualityScore() != null ? request.getInitialQualityScore() : 75)
                .status(Batch.BatchStatus.CREATED)
                .farmCity(request.getFarmCity())
                .farmState(request.getFarmState())
                .soilType(request.getSoilType())
                .irrigationType(request.getIrrigationType())
                .storageType(request.getStorageType())
                .storageLocation(request.getStorageLocation())
                .expectedShelfLifeDays(request.getExpectedShelfLife())
                .currentShelfLifeDays(request.getExpectedShelfLife())
                .moistureLevel(request.getMoistureLevel())
                .organic(Boolean.TRUE.equals(request.getOrganic()))
                .gapCertified(Boolean.TRUE.equals(request.getGapCertified()))
                .certifications(request.getCertifications() != null
                        ? "[\"" + String.join("\",\"", request.getCertifications()) + "\"]"
                        : "[]")
                .notes(request.getNotes())
                .sowingDate(request.getSowingDate() != null
                        ? LocalDate.parse(request.getSowingDate()) : null)
                .harvestDate(request.getHarvestDate() != null
                        ? LocalDate.parse(request.getHarvestDate()) : null)
                .cropImageUrl(resolveCropImageData(request))
                // ── Persist the QR URL to DB ───────────────────────────────
                .qrCodeUrl(qrResult.traceUrl())
                // ──────────────────────────────────────────────────────────
                .build();

        Batch saved = batchRepository.save(batch);

        createActivity(userId, "BATCH_CREATED", "Batch Created",
                "New batch created: " + request.getCropType(), batchId);

        // Create notification for farmer about batch creation
        notificationService.createNotification(userId, new CreateNotificationRequest(
                "BATCH_CREATED",
                "Batch Created Successfully",
                "Your batch " + batchId + " (" + request.getCropType() + ") has been created successfully. " +
                "Quantity: " + request.getQuantity() + " " + request.getQuantityUnit(),
                batchId
        ));

        // ── Step 3: Automatically create supply chain event (CREATED stage) ──
        try {
            User farmerUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Farmer not found"));
            
            SupplyChainEvent createdEvent = new SupplyChainEvent();
            createdEvent.setBatchId(batchId);
            createdEvent.setStage(SupplyChainEvent.SupplyChainStage.CREATED);
            createdEvent.setActorId(userId);
            createdEvent.setActorName(farmerUser.getFullName());
            createdEvent.setActorRole("FARMER");
            createdEvent.setLocation(request.getFarmCity() + ", " + request.getFarmState());
            createdEvent.setTimestamp(java.time.LocalDateTime.now());
            
            // Log the supply chain event
            supplyChainService.logSupplyChainEvent(createdEvent);
            
            log.info("✅ Supply chain event created for batch: {} (CREATED stage)", batchId);
        } catch (Exception e) {
            log.warn("⚠️ Warning: Failed to create supply chain event for batch creation: {}", e.getMessage());
            // Don't fail the batch creation if supply chain logging fails
        }
        // ─────────────────────────────────────────────────────────────────────

        // ── Step 4: Map to DTO and attach Base64 QR ─────────────────────────
        BatchDto dto = mapToBatchDto(saved);
        dto.setQrCodeBase64(qrResult.base64Image()); // Only in response, NOT stored in DB
        return dto;
        // ─────────────────────────────────────────────────────────────────────
    }

    // Profile Methods
    public FarmerProfileDto getFarmerProfile(String principal) {
        User user = resolveUser(principal);
        FarmerProfile profile = farmerProfileRepository.findByFarmerId(user.getId())
                .orElseGet(() -> {
                    String farmId = "FARM-" + user.getId();
                    FarmerProfile created = new FarmerProfile();
                    created.setUser(user);
                    created.setFarmId(farmId);
                    created.setVerified(false);
                    farmerProfileRepository.save(created);

                    FarmDetails stub = FarmDetails.builder()
                            .farmerProfile(created)
                            .farmId(farmId)
                            .build();
                    created.setFarmDetails(stub);
                    farmDetailsRepository.save(stub);
                    return created;
                });
        FarmDetails farmDetails = farmDetailsRepository.findByFarmerId(user.getId()).orElse(null);
        return mapToFarmerProfileDto(profile, user, farmDetails);
    }

    @Transactional
    public FarmerProfileDto updateFarmerProfile(String principal, UpdateFarmerProfileRequest request) {
        User user = resolveUser(principal);
        FarmerProfile profile = farmerProfileRepository.findByFarmerId(user.getId())
                .orElseThrow(() -> new RuntimeException("Farmer profile not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfileImageUrl() != null) profile.setProfileImageUrl(request.getProfileImageUrl());
        if (request.getProfileImageBase64() != null) profile.setProfileImageBase64(request.getProfileImageBase64());

        userRepository.save(user);
        FarmerProfile updated = farmerProfileRepository.save(profile);
        FarmDetails farmDetails = farmDetailsRepository.findByFarmerId(user.getId()).orElse(null);
        return mapToFarmerProfileDto(updated, user, farmDetails);
    }

    @Transactional
    public void changePassword(String principal, ChangePasswordRequest request) {
        User user = resolveUser(principal);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ============ FARM DETAILS METHODS ============
    @Transactional
    public FarmDetailsDto updateFarmDetails(String principal, UpdateFarmDetailsRequest request) {
        User user = resolveUser(principal);

        FarmDetails farmDetails = farmDetailsRepository.findByFarmerId(user.getId())
                .orElseThrow(() -> new RuntimeException("Farm details not found"));

        if (request.getFarmName() != null) farmDetails.setFarmName(request.getFarmName());
        if (request.getFarmLocation() != null) farmDetails.setFarmLocation(request.getFarmLocation());
        if (request.getFarmSize() != null) farmDetails.setFarmSize(request.getFarmSize());
        if (request.getPrimaryCrops() != null) farmDetails.setPrimaryCrops(request.getPrimaryCrops());
        if (request.getSoilType() != null) farmDetails.setSoilType(request.getSoilType());
        if (request.getIrrigationType() != null) farmDetails.setIrrigationType(request.getIrrigationType());

        FarmDetails updated = farmDetailsRepository.save(farmDetails);
        return mapToFarmDetailsDto(updated);
    }

    public FarmDetailsDto getFarmDetails(String principal) {
        User user = resolveUser(principal);

        FarmDetails farmDetails = farmDetailsRepository.findByFarmerId(user.getId())
                .orElseGet(() -> {
                    FarmerProfile profile = farmerProfileRepository.findByFarmerId(user.getId())
                            .orElseGet(() -> {
                                FarmerProfile created = new FarmerProfile();
                                created.setUser(user);
                                created.setFarmId("FARM-" + user.getId());
                                return farmerProfileRepository.save(created);
                            });
                    FarmDetails stub = FarmDetails.builder()
                            .farmerProfile(profile)
                            .farmId(profile.getFarmId() != null ? profile.getFarmId() : "FARM-" + user.getId())
                            .build();
                    profile.setFarmDetails(stub);
                    return farmDetailsRepository.save(stub);
                });

        return mapToFarmDetailsDto(farmDetails);
    }

    // Batch Methods
    public List<KpiCardDto> getKpis(String email) {
        Long userId = getUserIdFromEmail(email);
        List<Batch> batches = batchRepository.findByFarmerId(userId);

        long totalBatches = batches.size();
        double avgQualityScore = batches.stream()
                .mapToInt(b -> b.getQualityScore() != null ? b.getQualityScore() : 0)
                .average()
                .orElse(0);

        long highQualityCount = batches.stream()
                .filter(b -> b.getQualityScore() != null && b.getQualityScore() >= 80)
                .count();

        List<KpiCardDto> kpis = new ArrayList<>();
        kpis.add(new KpiCardDto("Total Batches", String.valueOf(totalBatches),
                "This season", "📊", "#166534", "STABLE", "+0%"));
        kpis.add(new KpiCardDto("Quality Score", String.format("%.1f%%", avgQualityScore),
                "Average", "✅", "#0369A1", "UP", "+5%"));
        kpis.add(new KpiCardDto("Avg Yield", "8.5 t/acre",
                "Estimated", "🌾", "#92400E", "STABLE", "0%"));
        kpis.add(new KpiCardDto("Verified", highQualityCount + " batches",
                "High quality", "⭐", "#6D28D9", "UP", "+2"));

        return kpis;
    }

    public Page<BatchDto> getBatches(String email, Pageable pageable) {
        Long userId = getUserIdFromEmail(email);
        return batchRepository.findByFarmerId(userId, pageable)
                .map(this::mapToBatchDto);
    }

    public Page<BatchDto> getBatchesByStatus(String email, String status, Pageable pageable) {
        Long userId = getUserIdFromEmail(email);
        Batch.BatchStatus batchStatus = Batch.BatchStatus.valueOf(status);
        return batchRepository.findByFarmerIdAndStatus(userId, batchStatus, pageable)
                .map(this::mapToBatchDto);
    }

    public BatchDto getBatchById(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        
        // Map batch to DTO
        BatchDto dto = mapToBatchDto(batch);
        
        // Generate and attach QR code base64 (image data for display)
        QrCodeService.QrCodeResult qrResult = qrCodeService.generateBatchQrCode(batchId);
        dto.setQrCodeBase64(qrResult.base64Image()); // data:image/png;base64,...
        
        return dto;
    }

    @Transactional
    public BatchDto markBatchAsHarvested(String email, String batchId) {
        Long userId = getUserIdFromEmail(email);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (!userId.equals(batch.getFarmerId())) {
            throw new RuntimeException("Unauthorized: Batch does not belong to current farmer");
        }

        if (batch.getStatus() != Batch.BatchStatus.CREATED) {
            throw new RuntimeException("Only CREATED batches can be marked as HARVESTED. Current status: " + batch.getStatus());
        }

        batch.setStatus(Batch.BatchStatus.HARVESTED);
        batch.setLastStatusChangeAt(java.time.LocalDateTime.now());
        batch.setLastStatusChangedBy(userId);

        Batch saved = batchRepository.save(batch);

        createActivity(userId, "BATCH_HARVESTED", "Batch Harvested",
                "Batch marked as harvested: " + batchId, batchId);

        notificationService.createNotification(userId, new CreateNotificationRequest(
                "BATCH_UPDATED",
                "Batch Marked as Harvested",
                "Your batch " + batchId + " is now HARVESTED and ready for transfer.",
                batchId
        ));

        return mapToBatchDto(saved);
    }



    // ✅ TRANSFER LOGIC REMOVED - Now handled by BatchTransferService
    // See: /api/v1/transfers endpoints in BatchTransferController

    // Activity Methods
    public List<ActivityItemDto> getActivities(String email) {
        Long userId = getUserIdFromEmail(email);
        return activityRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(20)
                .map(this::mapToActivityItemDto)
                .collect(Collectors.toList());
    }

    private ActivityItemDto mapToActivityItemDto(Activity activity) {
        String time = activity.getCreatedAt() != null
                ? activity.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM, HH:mm"))
                : "";
        ActivityItemDto dto = new ActivityItemDto();
        dto.setId(activity.getId());
        dto.setActionType(activity.getActionType());
        dto.setTitle(activity.getTitle());
        dto.setDescription(activity.getDescription());
        dto.setBatchId(activity.getBatchId());
        dto.setTime(time);
        dto.setBadge(resolveBadge(activity.getActionType()));
        dto.setBadgeColor(resolveBadgeColor(activity.getActionType()));
        return dto;
    }

    private String resolveBadge(String actionType) {
        if (actionType == null) return "Activity";
        return switch (actionType) {
            case "BATCH_CREATED" -> "Created";
            case "BATCH_TRANSFERRED" -> "Transfer";
            case "BATCH_UPDATED" -> "Updated";
            case "BATCH_FLAGGED" -> "Flagged";
            default -> "Activity";
        };
    }

    private String resolveBadgeColor(String actionType) {
        if (actionType == null) return "#6B7280";
        return switch (actionType) {
            case "BATCH_CREATED" -> "#166534";
            case "BATCH_TRANSFERRED" -> "#7C3AED";
            case "BATCH_UPDATED" -> "#0369A1";
            case "BATCH_FLAGGED" -> "#B91C1C";
            default -> "#6B7280";
        };
    }

    // Quality Trends
    public List<QualityTrendPointDto> getQualityTrends(String email) {
        Long userId = getUserIdFromEmail(email);
        List<Batch> batches = batchRepository.findByFarmerId(userId);
        Map<String, List<Batch>> batchesByMonth = new TreeMap<>();

        // Group batches by month
        for (Batch batch : batches) {
            String month = batch.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM yyyy"));
            batchesByMonth.computeIfAbsent(month, k -> new ArrayList<>()).add(batch);
        }

        List<QualityTrendPointDto> trends = new ArrayList<>();
        for (Map.Entry<String, List<Batch>> entry : batchesByMonth.entrySet()) {
            List<Batch> monthBatches = entry.getValue();
            double avgQuality = monthBatches.stream()
                    .mapToInt(b -> b.getQualityScore() != null ? b.getQualityScore() : 0)
                    .average()
                    .orElse(0);

            QualityTrendPointDto trend = new QualityTrendPointDto();
            trend.setMonth(entry.getKey());
            trend.setWheat(avgQuality);
            trend.setRice(avgQuality);
            trend.setCorn(avgQuality);
            trend.setPotato(avgQuality);
            trends.add(trend);
        }

        return trends;
    }

    // Shelf Life
    public List<ShelfLifeItemDto> getShelfLife(String email) {
        Long userId = getUserIdFromEmail(email);
        List<Batch> batches = batchRepository.findByFarmerId(userId);
        return batches.stream()
                .filter(b -> b.getStatus() == Batch.BatchStatus.HARVESTED || b.getStatus() == Batch.BatchStatus.RECEIVED_BY_DIST)
                .map(b -> {
                    int daysLeft = b.getCurrentShelfLifeDays() != null ? b.getCurrentShelfLifeDays() : 0;
                    int total = b.getExpectedShelfLifeDays() != null ? b.getExpectedShelfLifeDays() : 1;
                    int percent = (daysLeft * 100) / Math.max(total, 1);
                    // Use "Moderate" (not "Warning") to match frontend ShelfLifeItem type
                    String status = daysLeft > 15 ? "Healthy" : daysLeft > 7 ? "Moderate" : "Critical";

                    return new ShelfLifeItemDto(b.getCropType(), b.getId(), daysLeft, percent, status);
                })
                .collect(Collectors.toList());
    }

    // Recipients (distributors + retailers the farmer can transfer to)
    public List<RecipientDto> getRecipients() {
        List<User> recipients = userRepository.findByRoleIn(
                List.of(User.UserRole.DISTRIBUTOR, User.UserRole.RETAILER));
        return recipients.stream()
                .map(u -> new RecipientDto(
                        String.valueOf(u.getId()),
                        u.getFullName(),
                        u.getRole().name(),
                        "",   // city — not stored on User; left blank
                        "",   // state
                        u.getPhone() != null ? u.getPhone() : "",
                        0.0,  // rating
                        0,    // batchesReceived
                        "",   // specialty
                        true  // verified
                ))
                .collect(Collectors.toList());
    }

    // Helper Methods
    private Long getUserIdFromEmail(String principal) {
        return resolveUser(principal).getId();
    }

    private User resolveUser(String principal) {
        // Try by email first
        Optional<User> byEmail = userRepository.findByEmail(principal);
        if (byEmail.isPresent()) return byEmail.get();
        // Fallback: if principal looks like a numeric id, try by id
        try {
            Long id = Long.parseLong(principal);
            return userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } catch (NumberFormatException ex) {
            throw new RuntimeException("User not found");
        }
    }

    private void createActivity(Long userId, String actionType, String title, String description, String batchId) {
        Activity activity = Activity.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .userRole("FARMER")
                .actionType(actionType)
                .title(title)
                .description(description)
                .batchId(batchId)
                .build();
        activityRepository.save(activity);
    }

    // ✅ NOTIFICATION CREATION REMOVED - Now handled by NotificationService
    // See: /api/v1/notifications endpoints in NotificationController

    private FarmerProfileDto mapToFarmerProfileDto(FarmerProfile profile, User user, FarmDetails farmDetails) {
        FarmerProfileDto dto = new FarmerProfileDto();
        dto.setUserId(profile.getFarmerId());
        dto.setFarmerId(profile.getFarmerId());
        dto.setVerified(profile.getVerified());
        dto.setRating(profile.getRating());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        dto.setProfileImageBase64(profile.getProfileImageBase64());
        dto.setFarmId(profile.getFarmId());

        if (user != null) {
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole().name());
            dto.setMemberSince(user.getCreatedAt() != null
                    ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM yyyy"))
                    : "");
        }

        if (farmDetails != null) {
            dto.setFarmId(farmDetails.getFarmId());
            dto.setFarmName(farmDetails.getFarmName());
            dto.setFarmLocation(farmDetails.getFarmLocation());
            dto.setFarmSize(farmDetails.getFarmSize());
            dto.setPrimaryCrops(farmDetails.getPrimaryCrops());
            dto.setSoilType(farmDetails.getSoilType());
            dto.setIrrigationType(farmDetails.getIrrigationType());
            dto.setIrrigationMethod(farmDetails.getIrrigationType());
            dto.setFarmDetails(mapToFarmDetailsDto(farmDetails));
        }
        return dto;
    }

    // ============ MAPPING HELPERS ============
    private BatchDto mapToBatchDto(Batch batch) {
        return BatchDto.builder()
                .id(batch.getId())
                .farmerId(batch.getFarmerId())
                .cropType(batch.getCropType())
                .variety(batch.getVariety())
                .quantity(batch.getQuantity())
                .quantityUnit(batch.getQuantityUnit() != null ? batch.getQuantityUnit().name() : null)
                .pricePerUnit(batch.getPricePerUnit())
                .qualityScore(batch.getQualityScore())
                .qualityGrade(batch.getQualityGrade())
                .status(batch.getStatus() != null ? batch.getStatus().name() : null)
                .farmCity(batch.getFarmCity())
                .farmState(batch.getFarmState())
                .storageType(batch.getStorageType())
                .storageLocation(batch.getStorageLocation())
                .soilType(batch.getSoilType())
                .irrigationType(batch.getIrrigationType())
                .expectedShelfLifeDays(batch.getExpectedShelfLifeDays())
                .currentShelfLifeDays(batch.getCurrentShelfLifeDays())
                .moistureLevel(batch.getMoistureLevel())
                .organic(batch.getOrganic())
                .gapCertified(batch.getGapCertified())
                .certifications(batch.getCertifications())
                .sowingDate(batch.getSowingDate())
                .harvestDate(batch.getHarvestDate())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .notes(batch.getNotes())
                .cropImageUrl(batch.getCropImageUrl())
                .qrCodeUrl(batch.getQrCodeUrl()) // The trace URL (also stored in DB)
                // qrCodeBase64 is intentionally NOT set here — set it only after generation
                .build();
    }

    private String resolveCropImageData(CreateBatchRequest request) {
        if (request.getCropImageBase64() != null && !request.getCropImageBase64().isBlank()) {
            String imageData = request.getCropImageBase64();
            if (imageData.length() > 10_000_000) {
                throw new RuntimeException("Crop image is too large. Please upload an image smaller than 7 MB.");
            }
            return imageData;
        }
        if (request.getCropImageUrl() != null && !request.getCropImageUrl().isBlank()) {
            return request.getCropImageUrl();
        }
        return null;
    }

    private FarmDetailsDto mapToFarmDetailsDto(FarmDetails farmDetails) {
        return FarmDetailsDto.builder()
                .id(farmDetails.getId())
                .farmId(farmDetails.getFarmId())
                .farmName(farmDetails.getFarmName())
                .farmLocation(farmDetails.getFarmLocation())
                .farmSize(farmDetails.getFarmSize())
                .primaryCrops(farmDetails.getPrimaryCrops())
                .soilType(farmDetails.getSoilType())
                .irrigationType(farmDetails.getIrrigationType())
                .build();
    }
}
