package vn.edu.hcmuaf.virtualnluapi.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults (level = AccessLevel.PRIVATE)
public class HotspotNavigationResponse {
    int id;
    int nodeId;
    byte type;
    int iconId;
    double positionX, positionY, positionZ;
    double pitchX, yawY, rollZ;
    float scale;
    String color, backgroundColor;
    byte allowBackgroundColor;
    float opacity;
    int targetNodeId;
}
