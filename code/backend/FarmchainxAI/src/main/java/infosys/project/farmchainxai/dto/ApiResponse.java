package infosys.project.farmchainxai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String message;
    private T data;
    private boolean success;
    private long timestamp;

    public ApiResponse(String message, T data, boolean success) {
        this.message = message;
        this.data = data;
        this.success = success;
        this.timestamp = System.currentTimeMillis();
    }

    public ApiResponse(boolean b, String profileUpdatedSuccessfully, FarmerProfileDto updated) {
    }
}
