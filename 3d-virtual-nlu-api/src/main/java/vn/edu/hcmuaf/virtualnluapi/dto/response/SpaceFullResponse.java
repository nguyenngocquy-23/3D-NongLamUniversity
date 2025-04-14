package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpaceFullResponse {
    int id;
    String fieldName, name, description;
    byte status;
    LocalDateTime updatedAt;
}
