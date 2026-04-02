package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.DistributorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DistributorProfileRepository extends JpaRepository<DistributorProfile, Long> {
    Optional<DistributorProfile> findByDistributorId(Long distributorId);
}
