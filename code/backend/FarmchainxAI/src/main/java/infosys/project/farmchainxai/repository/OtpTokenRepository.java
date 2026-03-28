package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    @Query("SELECT o FROM OtpToken o WHERE o.identifier = ?1 AND o.otp = ?2 AND o.isUsed = false AND o.expiresAt > ?3 ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpToken> findValidOtp(String identifier, String otp, LocalDateTime now);

    @Query("SELECT o FROM OtpToken o WHERE o.identifier = ?1 AND o.isUsed = false AND o.expiresAt > ?2 ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpToken> findLatestValidOtpByIdentifier(String identifier, LocalDateTime now);
}
