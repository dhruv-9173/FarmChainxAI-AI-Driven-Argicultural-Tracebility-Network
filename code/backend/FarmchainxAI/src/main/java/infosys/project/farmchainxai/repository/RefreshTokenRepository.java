package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.RefreshToken;
import infosys.project.farmchainxai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenAndIsRevokedFalse(String token);
    Optional<RefreshToken> findByUserAndIsRevokedFalse(User user);
    void deleteByUser(User user);
}
