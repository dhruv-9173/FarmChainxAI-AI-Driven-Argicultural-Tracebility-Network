package infosys.project.farmchainxai.dto;

import infosys.project.farmchainxai.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private User.UserRole role;
    private String phone;
    private String createdAt;
}
