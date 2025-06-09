package vn.edu.hcmuaf.virtualnluapi.dto.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    int id, userId, nodeId, parentId;
    String content, username, avatar;
    int status;
    Timestamp updatedAt;
}
