package vn.edu.hcmuaf.virtualnluapi.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults (level = AccessLevel.PRIVATE)
public class HotspotMediaResponse {
    byte type;
    int iconId;
    double positionX, positionY, positionZ;
    double pitchX, yawY, rollZ;
    float scale;
    String mediaType, mediaUrl, caption, cornerPointList;
}
