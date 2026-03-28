package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.*;
import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DistributorService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private BatchTransferRepository batchTransferRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    /**
     * Get distributor profile information
     */
    public DistributorProfileDto getDistributorProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (user.getRole() != User.UserRole.DISTRIBUTOR) {
            throw new RuntimeException("User is not a distributor");
        }

        return DistributorProfileDto.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .distributorId("DIS-" + user.getId())
                .memberSince(user.getCreatedAt() != null
                        ? user.getCreatedAt().format(dateFormatter)
                        : "")
                .avatarUrl("/api/avatars/default.png")
                .companyName("FarmChain Distribution")
                .companyId("COM-" + user.getId())
                .warehouseLocation("Pune, Maharashtra")
                .gstNumber("27AAPPL3100A2ZN")
                .licenseNumber("LIC-2024-" + user.getId())
                .operationalArea("Entire Maharashtra")
                .warehouseCapacity("100,000 kg")
                .establishedYear("2020")
                .build();
    }

    /**
     * Update distributor profile
     */
    @Transactional
    public DistributorProfileDto updateDistributorProfile(String email, DistributorProfileDto request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (user.getRole() != User.UserRole.DISTRIBUTOR) {
            throw new RuntimeException("User is not a distributor");
        }

        // Update basic user info
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            user.setPhone(request.getPhone());
        }

        userRepository.save(user);

        return getDistributorProfile(email);
    }

    /**
     * Change password for distributor
     */
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Get KPIs for distributor dashboard
     */
    public List<KpiCardDto> getKpis(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Long userId = user.getId();

        // Count batches by status (received by distributor as recipient)
        List<BatchTransfer> receivedTransfers = batchTransferRepository.findByRecipientId(userId);
        List<BatchTransfer> sentTransfers = batchTransferRepository.findBySenderId(userId);

        long totalReceived = receivedTransfers.stream()
                .filter(t -> t.getTransferStatus() == BatchTransfer.TransferStatus.ACCEPTED)
                .count();

        long totalTransferred = sentTransfers.stream()
                .filter(t -> t.getTransferStatus() == BatchTransfer.TransferStatus.ACCEPTED)
                .count();

        long pending = receivedTransfers.stream()
                .filter(t -> t.getTransferStatus() == BatchTransfer.TransferStatus.PENDING)
                .count();

        // Calculate quality average
        double qualityAverage = receivedTransfers.stream()
                .map(transfer -> {
                    Batch batch = batchRepository.findById(transfer.getBatchId()).orElse(null);
                    return batch != null ? batch.getQualityScore() : 0;
                })
                .filter(score -> score > 0)
                .mapToDouble(Integer::doubleValue)
                .average()
                .orElse(0.0);

        List<KpiCardDto> kpis = new ArrayList<>();
        kpis.add(new KpiCardDto(
                "Total Batches Received",
                String.valueOf(totalReceived),
                "batches received",
                "box",
                "#166534",
                "UP",
                "+12%"
        ));

        kpis.add(new KpiCardDto(
                "Batches Transferred",
                String.valueOf(totalTransferred),
                "batches transferred",
                "truck",
                "#059669",
                "UP",
                "+8%"
        ));

        kpis.add(new KpiCardDto(
                "Pending Approvals",
                String.valueOf(pending),
                "awaiting approval",
                "clock",
                "#D97706",
                "STABLE",
                ""
        ));

        kpis.add(new KpiCardDto(
                "Quality Score",
                String.format("%.0f%%", qualityAverage),
                "average quality",
                "star",
                "#0369A1",
                "UP",
                "+2%"
        ));

        return kpis;
    }

    /**
     * Get received batches for distributor
     */
    public List<DistributorBatchDto> getReceivedBatches(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Long userId = user.getId();

        // Get all batches where distributor_id = current user
        // This includes TRANSFERRED (just sent) and RECEIVED (accepted) statuses
        List<Batch> batchesByDistributorId = batchRepository.findByDistributorId(userId);

        // For backward compatibility: also get batches from transfers where user is recipient and accepted
        List<BatchTransfer> acceptedTransfers = batchTransferRepository.findByRecipientIdAndTransferStatus(userId, BatchTransfer.TransferStatus.ACCEPTED);
        Set<String> batchIdsFromTransfers = acceptedTransfers.stream()
                .map(BatchTransfer::getBatchId)
                .collect(Collectors.toSet());

        // Combine both sources and deduplicate by batch ID
        Map<String, Batch> batchMap = new LinkedHashMap<>();
        
        for (Batch batch : batchesByDistributorId) {
            batchMap.put(batch.getId(), batch);
        }

        for (String batchId : batchIdsFromTransfers) {
            if (!batchMap.containsKey(batchId)) {
                Batch batch = batchRepository.findById(batchId).orElse(null);
                if (batch != null) {
                    batchMap.put(batchId, batch);
                }
            }
        }

        return batchMap.values().stream()
                .map(batch -> {
                    User farmer = userRepository.findById(batch.getFarmerId()).orElse(null);

                    int shelfLifePercent = 0;
                    if (batch.getExpectedShelfLifeDays() != null && batch.getExpectedShelfLifeDays() > 0) {
                        shelfLifePercent = (batch.getCurrentShelfLifeDays() != null 
                                ? (batch.getCurrentShelfLifeDays() * 100) / batch.getExpectedShelfLifeDays()
                                : 0);
                    }

                    // Get inspection note from transfer history
                    List<BatchTransfer> transfers = batchTransferRepository.findByBatchIdAndRecipientId(batch.getId(), userId);
                    String inspectionNote = transfers.stream()
                            .findFirst()
                            .map(BatchTransfer::getInspectionNote)
                            .orElse("");

                    return DistributorBatchDto.builder()
                            .id(batch.getId())
                            .cropType(batch.getCropType())
                            .variety(batch.getVariety())
                            .quantity(batch.getQuantity() + " " + batch.getQuantityUnit().name())
                            .qualityScore(batch.getQualityScore())
                            .status(batch.getStatus().name())
                            .farmerName(farmer != null ? farmer.getFullName() : "Unknown")
                            .farmerId("FRM-" + batch.getFarmerId())
                            .farmLocation(batch.getFarmCity() + ", " + batch.getFarmState())
                            .receivedAt(batch.getCreatedAt() != null
                                    ? batch.getCreatedAt().format(dateFormatter)
                                    : "")
                            .shelfLifeDays(batch.getExpectedShelfLifeDays())
                            .shelfLifePercent(shelfLifePercent)
                            .basePrice(null)
                            .marketPrice(null)
                            .qualityGrade(batch.getQualityGrade())
                            .organic(batch.getOrganic())
                            .inspectionNote(inspectionNote)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get pending batches for distributor (awaiting approval)
     */
    public List<DistributorBatchDto> getPendingBatches(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Long userId = user.getId();

        // Get pending transfers where user is recipient (still using transfers for pending status)
        List<BatchTransfer> transfers = batchTransferRepository.findByRecipientIdAndTransferStatus(userId, BatchTransfer.TransferStatus.PENDING);

        return transfers.stream()
                .map(transfer -> {
                    Batch batch = batchRepository.findById(transfer.getBatchId())
                            .orElse(null);
                    if (batch == null) return null;

                    User farmer = userRepository.findById(batch.getFarmerId()).orElse(null);

                    int shelfLifePercent = 0;
                    if (batch.getExpectedShelfLifeDays() != null && batch.getExpectedShelfLifeDays() > 0) {
                        shelfLifePercent = (batch.getCurrentShelfLifeDays() != null 
                                ? (batch.getCurrentShelfLifeDays() * 100) / batch.getExpectedShelfLifeDays()
                                : 0);
                    }

                    return DistributorBatchDto.builder()
                            .id(batch.getId())
                            .cropType(batch.getCropType())
                            .variety(batch.getVariety())
                            .quantity(batch.getQuantity() + " " + batch.getQuantityUnit().name())
                            .qualityScore(batch.getQualityScore())
                            .status("Incoming")
                            .farmerName(farmer != null ? farmer.getFullName() : "Unknown")
                            .farmerId("FRM-" + batch.getFarmerId())
                            .farmLocation(batch.getFarmCity() + ", " + batch.getFarmState())
                            .receivedAt(transfer.getCreatedAt() != null
                                    ? transfer.getCreatedAt().format(dateFormatter)
                                    : "")
                            .shelfLifeDays(batch.getExpectedShelfLifeDays())
                            .shelfLifePercent(shelfLifePercent)
                            .basePrice(null)
                            .marketPrice(null)
                            .qualityGrade(batch.getQualityGrade())
                            .organic(batch.getOrganic())
                            .inspectionNote(transfer.getInspectionNote())
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Get activity log for distributor
     */
    public List<DistributorActivityDto> getActivityLog(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Long userId = user.getId();

        List<Activity> activities = activityRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return activities.stream()
                .limit(20)
                .map(activity -> {
                    String badge = "default";
                    String badgeColor = "secondary";

                    if (activity.getActionType() != null) {
                        switch (activity.getActionType()) {
                            case "BATCH_ACCEPTED":
                                badge = "Accepted";
                                badgeColor = "success";
                                break;
                            case "BATCH_REJECTED":
                                badge = "Rejected";
                                badgeColor = "danger";
                                break;
                            case "BATCH_TRANSFERRED":
                                badge = "Transferred";
                                badgeColor = "primary";
                                break;
                            case "BATCH_RECEIVED":
                                badge = "Received";
                                badgeColor = "info";
                                break;
                        }
                    }

                    return DistributorActivityDto.builder()
                            .id(activity.getId())
                            .title(activity.getTitle())
                            .description(activity.getDescription())
                            .time(activity.getCreatedAt() != null
                                    ? activity.getCreatedAt().format(timeFormatter)
                                    : "")
                            .badge(badge)
                            .badgeColor(badgeColor)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get analytics data for distributor (monthly summary)
     */
    public List<DistributorAnalyticsDto> getAnalytics(String email) {
        // Validate user exists
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Group by month and count statuses
        Map<String, DistributorAnalyticsDto> analyticsMap = new LinkedHashMap<>();

        String[] months = {"January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};

        for (String month : months) {
            analyticsMap.put(month, DistributorAnalyticsDto.builder()
                    .month(month)
                    .received(0)
                    .transferred(0)
                    .rejected(0)
                    .build());
        }

        // Simple mock data - in production, this would be based on actual timestamps
        analyticsMap.put("January", DistributorAnalyticsDto.builder()
                .month("January")
                .received(45)
                .transferred(35)
                .rejected(8)
                .build());

        analyticsMap.put("February", DistributorAnalyticsDto.builder()
                .month("February")
                .received(52)
                .transferred(42)
                .rejected(6)
                .build());

        analyticsMap.put("March", DistributorAnalyticsDto.builder()
                .month("March")
                .received(38)
                .transferred(30)
                .rejected(5)
                .build());

        return new ArrayList<>(analyticsMap.values());
    }

    /**
     * Get retailers (recipients) for transfer operations
     */
    public List<TransferRecipientDto> getRetailRecipients(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Long userId = user.getId();

        // Get all transfers sent by this distributor
        List<BatchTransfer> transfers = batchTransferRepository.findBySenderId(userId);

        // Get unique retailers
        Map<Long, TransferRecipientDto> recipientMap = new HashMap<>();

        for (BatchTransfer transfer : transfers) {
            User recipient = userRepository.findById(transfer.getRecipientId()).orElse(null);

            if (recipient != null && 
                (recipient.getRole() == User.UserRole.RETAILER || 
                 recipient.getRole() == User.UserRole.CONSUMER)) {

                recipientMap.putIfAbsent(recipient.getId(),
                        TransferRecipientDto.builder()
                                .id(recipient.getId())
                                .fullName(recipient.getFullName())
                                .email(recipient.getEmail())
                                .phone(recipient.getPhone())
                                .role(recipient.getRole().name())
                                .transferCount(1L)
                                .lastTransferDate(transfer.getCreatedAt() != null
                                        ? transfer.getCreatedAt().format(timeFormatter)
                                        : "")
                                .build()
                );

                TransferRecipientDto dto = recipientMap.get(recipient.getId());
                dto.setTransferCount(dto.getTransferCount() + 1);
                dto.setLastTransferDate(transfer.getCreatedAt() != null
                        ? transfer.getCreatedAt().format(timeFormatter)
                        : "");
            }
        }

        return new ArrayList<>(recipientMap.values());
    }

    /**
     * Search for retailers to transfer to
     */
    public List<TransferRecipientDto> searchRetailers(String email, String searchQuery) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String query = searchQuery.toLowerCase().trim();

        // Get all retailers and consumers
        List<User> retailers = userRepository.findByRole(User.UserRole.RETAILER);
        List<User> consumers = userRepository.findByRole(User.UserRole.CONSUMER);

        List<User> allRecipients = new ArrayList<>(retailers);
        allRecipients.addAll(consumers);

        // Get transfers sent by this distributor
        List<BatchTransfer> allTransfers = batchTransferRepository.findBySenderId(user.getId());

        return allRecipients.stream()
                .filter(r -> !r.getId().equals(user.getId()))
                .filter(r -> r.getFullName().toLowerCase().contains(query) ||
                           r.getEmail().toLowerCase().contains(query))
                .map(r -> {
                    List<BatchTransfer> userTransfers = allTransfers.stream()
                            .filter(t -> t.getRecipientId().equals(r.getId()))
                            .collect(Collectors.toList());

                    long transferCount = userTransfers.size();

                    String lastTransferDate = userTransfers.stream()
                            .max(Comparator.comparing(BatchTransfer::getCreatedAt))
                            .map(t -> t.getCreatedAt() != null
                                    ? t.getCreatedAt().format(timeFormatter)
                                    : "")
                            .orElse("");

                    return TransferRecipientDto.builder()
                            .id(r.getId())
                            .fullName(r.getFullName())
                            .email(r.getEmail())
                            .phone(r.getPhone())
                            .role(r.getRole().name())
                            .transferCount(transferCount)
                            .lastTransferDate(lastTransferDate)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get notifications for distributor
     */
    public List<NotificationDto> getNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return notifications.stream()
                .limit(10)
                .map(n -> NotificationDto.builder()
                        .id(n.getId())
                        .type(n.getType())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt() != null
                                ? n.getCreatedAt().format(timeFormatter)
                                : "")
                        .build())
                .collect(Collectors.toList());
    }
}
