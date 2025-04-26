package vn.edu.hcmuaf.virtualnluapi.dto.response;

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
public class NodeFullResponse {
    int id,userId;
    String fieldName, spaceName, name, description, url;
    double positionX,positionY,positionZ, lightIntensity, speedRotate;
    byte status, autoRotate;
    Timestamp updatedAt;
}
