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
public class FieldResponse {
    int id;
    String code,name;
    byte status;
    LocalDateTime updatedAt;
}
