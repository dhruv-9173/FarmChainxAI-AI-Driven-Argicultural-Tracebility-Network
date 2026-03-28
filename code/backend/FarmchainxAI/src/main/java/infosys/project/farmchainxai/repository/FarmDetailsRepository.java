package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.FarmDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmDetailsRepository extends JpaRepository<FarmDetails, Long> {
    
    @Query("SELECT fd FROM FarmDetails fd WHERE fd.farmerProfile.farmerId = :farmerId")
    Optional<FarmDetails> findByFarmerId(@Param("farmerId") Long farmerId);
    
    Optional<FarmDetails> findByFarmId(String farmId);
}

