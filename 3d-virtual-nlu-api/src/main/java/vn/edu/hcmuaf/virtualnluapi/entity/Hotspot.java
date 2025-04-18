package vn.edu.hcmuaf.virtualnluapi.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PROTECTED)
public class Hotspot {
    int id;
    double positionX, positionY, positionZ;
    double pitchX, yawY, rollZ;
    byte type;
    float scale;
    LocalDateTime createdAt, updatedAt;
    int nodeId;
    int iconId;
    boolean status;
}
