package vn.edu.hcmuaf.virtualnluapi.entity;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Node {
    int id, spaceId;
    String url, name, description;
    double positionX,positionY,positionZ, yawOffset;
    double lightIntensity, brightness, contrast, saturation, grayscale, exposure;
    byte status;
    Timestamp createdAt, updatedAt;
}
