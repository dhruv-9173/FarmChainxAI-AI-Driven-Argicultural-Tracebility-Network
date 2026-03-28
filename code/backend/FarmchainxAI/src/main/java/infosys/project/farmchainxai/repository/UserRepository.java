package infosys.project.farmchainxai.repository;

import infosys.project.farmchainxai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByPhone(String phone);
    Boolean existsByPhone(String phone);
    List<User> findByRoleIn(List<User.UserRole> roles);

    List<User> findByRole(User.UserRole role);
}
