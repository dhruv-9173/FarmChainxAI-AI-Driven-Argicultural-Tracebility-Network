package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    
    List<Review> findByBatchIdOrderByCreatedAtDesc(String batchId);
    
    Page<Review> findByBatchIdOrderByCreatedAtDesc(String batchId, Pageable pageable);
    
    List<Review> findByUserId(Long userId);
    
    Optional<Review> findByBatchIdAndUserId(String batchId, Long userId);
    
    int countByBatchId(String batchId);
}
