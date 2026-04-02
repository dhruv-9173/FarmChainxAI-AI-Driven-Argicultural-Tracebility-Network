package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.RetailerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RetailerProfileRepository extends JpaRepository<RetailerProfile, Long> {
    Optional<RetailerProfile> findByRetailerId(Long retailerId);
}
