package vn.edu.hcmuaf.virtualnluapi.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults (level = AccessLevel.PRIVATE)
public class HotspotModelCreateRequest {
    int nodeId;
    byte type;
    int iconId;
    double positionX, positionY, positionZ;
    double pitchX, yawY, rollZ;
    float scale;
    String modelUrl, name, description;
}
