package vn.edu.hcmuaf.virtualnluapi.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotspotInfoUpdateRequest {
    String id;
    String nodeId;
    byte type;
    int iconId;
    byte status;
    double positionX, positionY, positionZ;
    double pitchX, yawY, rollZ;
    float scale;
    String color, backgroundColor;
    byte allowBackgroundColor;
    float opacity;
    String content, backgroundColorContent, borderColorContent;
    float borderSizeContent;
}
