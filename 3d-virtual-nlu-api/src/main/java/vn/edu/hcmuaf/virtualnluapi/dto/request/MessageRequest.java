package vn.edu.hcmuaf.virtualnluapi.dto.request;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApplicationScoped
public class MessageRequest {
    private int userId, roomId;
    private String content;
}
