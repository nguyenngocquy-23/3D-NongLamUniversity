package vn.edu.hcmuaf.virtualnluapi.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults (level = AccessLevel.PRIVATE)
public class HotspotMediaResponse {
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
    String mediaType, mediaUrl, caption, cornerPointList;
}
