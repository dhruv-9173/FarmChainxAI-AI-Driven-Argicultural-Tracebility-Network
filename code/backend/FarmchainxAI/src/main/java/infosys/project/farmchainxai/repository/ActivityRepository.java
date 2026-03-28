package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Activity> findByUserId(Long userId, Pageable pageable);
    List<Activity> findByBatchId(String batchId);
}


