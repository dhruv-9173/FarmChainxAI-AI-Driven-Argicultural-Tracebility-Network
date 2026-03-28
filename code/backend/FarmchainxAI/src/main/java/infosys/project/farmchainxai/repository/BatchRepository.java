package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.Batch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, String> {
    Page<Batch> findByFarmerId(Long farmerId, Pageable pageable);
    Page<Batch> findByFarmerIdAndStatus(Long farmerId, Batch.BatchStatus status, Pageable pageable);
    List<Batch> findByFarmerId(Long farmerId);
    Optional<Batch> findById(String id);
    List<Batch> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    // Distributor queries
    List<Batch> findByDistributorId(Long distributorId);
    List<Batch> findByDistributorIdAndStatus(Long distributorId, Batch.BatchStatus status);
    List<Batch> findByDistributorIdOrderByCreatedAtDesc(Long distributorId);

    // Retailer queries
    List<Batch> findByRetailerId(Long retailerId);
    List<Batch> findByRetailerIdAndStatus(Long retailerId, Batch.BatchStatus status);
    List<Batch> findByRetailerIdOrderByCreatedAtDesc(Long retailerId);
}


