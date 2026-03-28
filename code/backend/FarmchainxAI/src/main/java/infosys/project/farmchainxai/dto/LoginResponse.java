package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private UserDto user;
    private TokenResponse tokens;
    private String message;
}
