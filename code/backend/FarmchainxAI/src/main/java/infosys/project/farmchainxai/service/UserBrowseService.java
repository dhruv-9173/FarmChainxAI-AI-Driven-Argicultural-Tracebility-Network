package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.dto.UserBatchSummaryDto;
import infosys.project.farmchainxai.dto.UserBrowseDto;
import infosys.project.farmchainxai.entity.*;
import infosys.project.farmchainxai.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for browsing user profiles with their batch information and statistics.
 */
@Service
@Slf4j
public class UserBrowseService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerProfileRepository farmerProfileRepository;

    @Autowired
    private BatchRepository batchRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Get all users except the current user, filtered by role.
     *
     * @param currentUserId The ID of the current user (to exclude)
     * @param roles         List of roles to filter by (can be empty for all)
     * @return List of UserBrowseDto
     */
    public List<UserBrowseDto> getAllUsers(Long currentUserId, List<User.UserRole> roles) {
        try {
            List<User> users;

            if (roles == null || roles.isEmpty()) {
                users = userRepository.findAll();
            } else {
                users = userRepository.findByRoleIn(roles);
            }

            return users.stream()
                    .filter(u -> !u.getId().equals(currentUserId) && u.getIsVerified()) // Exclude current user and unverified
                    .map(this::convertUserToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting all users: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Get a specific user's profile with detailed information.
     *
     * @param userId The ID of the user to fetch
     * @return UserBrowseDto with full details
     */
    public UserBrowseDto getUserProfile(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            return convertUserToDto(user);
        } catch (Exception e) {
            log.error("Error getting user profile for ID {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to fetch user profile: " + e.getMessage());
        }
    }

    /**
     * Search users by name or email with role filtering.
     *
     * @param searchTerm The search term (name or email)
     * @param roles      List of roles to filter by
     * @return List of matching UserBrowseDto
     */
    public List<UserBrowseDto> searchUsers(String searchTerm, List<User.UserRole> roles) {
        try {
            List<User> allUsers;

            if (roles == null || roles.isEmpty()) {
                allUsers = userRepository.findAll();
            } else {
                allUsers = userRepository.findByRoleIn(roles);
            }

            String lowerSearchTerm = searchTerm.toLowerCase().trim();

            return allUsers.stream()
                    .filter(u -> u.getIsVerified() &&
                            (u.getFullName().toLowerCase().contains(lowerSearchTerm) ||
                             u.getEmail().toLowerCase().contains(lowerSearchTerm)))
                    .map(this::convertUserToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching users: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Convert User entity to UserBrowseDto with all related information.
     *
     * @param user The user entity to convert
     * @return UserBrowseDto
     */
    private UserBrowseDto convertUserToDto(User user) {
        UserBrowseDto dto = UserBrowseDto.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().toString())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMAT) : "")
                .verificationStatus(user.getIsVerified() ? "Verified" : "Unverified")
                .build();

        // Load role-specific information
        if (user.getRole() == User.UserRole.FARMER) {
            loadFarmerInfo(user.getId(), dto);
        } else if (user.getRole() == User.UserRole.DISTRIBUTOR) {
            loadDistributorInfo(user.getId(), dto);
        } else if (user.getRole() == User.UserRole.RETAILER) {
            loadRetailerInfo(user.getId(), dto);
        }

        // Load batch information for all users
        loadBatchInfo(user.getId(), user.getRole(), dto);

        return dto;
    }

    /**
     * Load farmer-specific information into the DTO.
     */
    private void loadFarmerInfo(Long userId, UserBrowseDto dto) {
        try {
            Optional<FarmerProfile> farmerProfile = farmerProfileRepository.findById(userId);
            if (farmerProfile.isPresent()) {
                FarmerProfile profile = farmerProfile.get();
                dto.setFarmVerified(profile.getVerified());
                dto.setRating(profile.getRating());
                dto.setProfileImageUrl(profile.getProfileImageUrl());

                // Load farm details
                if (profile.getFarmDetails() != null) {
                    FarmDetails farmDetails = profile.getFarmDetails();
                    dto.setFarmId(profile.getFarmId());
                    dto.setFarmName(farmDetails.getFarmName());
                    dto.setLocation(farmDetails.getFarmLocation());
                    dto.setFarmSize(farmDetails.getFarmSize());
                    dto.setPrimaryCrops(farmDetails.getPrimaryCrops());
                    dto.setSoilType(farmDetails.getSoilType());
                }
            }
        } catch (Exception e) {
            log.warn("Error loading farmer info for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Load distributor-specific information into the DTO.
     */
    private void loadDistributorInfo(Long userId, UserBrowseDto dto) {
        try {
            // TODO: Load distributor profile when DistributorProfile entity is created
            dto.setBusinessName(dto.getFullName()); // Use full name as business name for now
        } catch (Exception e) {
            log.warn("Error loading distributor info for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Load retailer-specific information into the DTO.
     */
    private void loadRetailerInfo(Long userId, UserBrowseDto dto) {
        try {
            // TODO: Load retailer profile when RetailerProfile entity is created
            dto.setBusinessName(dto.getFullName()); // Use full name as business name for now
        } catch (Exception e) {
            log.warn("Error loading retailer info for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Load batch information for the user.
     */
    private void loadBatchInfo(Long userId, User.UserRole role, UserBrowseDto dto) {
        try {
            List<Batch> userBatches = new ArrayList<>();

            if (role == User.UserRole.FARMER) {
                userBatches = batchRepository.findByFarmerIdOrderByCreatedAtDesc(userId);
            } else if (role == User.UserRole.DISTRIBUTOR) {
                userBatches = batchRepository.findByDistributorIdOrderByCreatedAtDesc(userId);
            } else if (role == User.UserRole.RETAILER) {
                userBatches = batchRepository.findByRetailerIdOrderByCreatedAtDesc(userId);
            }

            // Calculate statistics
            dto.setTotalBatches(userBatches.size());
            dto.setActiveBatches((int) userBatches.stream()
                    .filter(b -> b.getStatus() == Batch.BatchStatus.CREATED || 
                                b.getStatus() == Batch.BatchStatus.AVAILABLE ||  
                                b.getStatus() == Batch.BatchStatus.HARVESTED)
                    .count());
            dto.setCompletedBatches((int) userBatches.stream()
                    .filter(b -> b.getStatus() == Batch.BatchStatus.DELIVERED)
                    .count());

            // Convert batches to summary DTOs (limit to 10 most recent)
            List<UserBatchSummaryDto> batchSummaries = userBatches.stream()
                    .limit(10)
                    .map(this::convertBatchToSummaryDto)
                    .collect(Collectors.toList());

            dto.setBatches(batchSummaries);
        } catch (Exception e) {
            log.warn("Error loading batch info for user {}: {}", userId, e.getMessage());
            dto.setTotalBatches(0);
            dto.setActiveBatches(0);
            dto.setCompletedBatches(0);
            dto.setBatches(Collections.emptyList());
        }
    }

    /**
     * Convert Batch entity to UserBatchSummaryDto.
     */
    private UserBatchSummaryDto convertBatchToSummaryDto(Batch batch) {
        try {
            // Generate a Long ID from batch code hash (batch ID is a String)
            Long batchIdLong = batch.getId().hashCode() > 0 ? 
                    (long) batch.getId().hashCode() : 
                    Math.abs((long) batch.getId().hashCode());
            
            return UserBatchSummaryDto.builder()
                    .batchId(batchIdLong)
                    .batchCode(batch.getId())
                    .cropType(batch.getCropType())
                    .cropVariety(batch.getVariety())
                    .quantity(batch.getQuantity())
                    .quantityUnit(batch.getQuantityUnit() != null ? batch.getQuantityUnit().toString() : "kg")
                    .batchStatus(batch.getStatus().toString())
                    .harvestDate(batch.getHarvestDate() != null ? batch.getHarvestDate().format(DATE_FORMAT) : "")
                    .quality(batch.getQualityGrade())
                    .qualityScore(batch.getQualityScore())
                    .organic(batch.getOrganic())
                    .gapCertified(batch.getGapCertified())
                    .build();
        } catch (Exception e) {
            log.warn("Error converting batch to summary: {}", e.getMessage());
            return null;
        }
    }
}
