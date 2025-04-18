package vn.edu.hcmuaf.virtualnluapi.entity;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotspotModel {
    int hotspotId;
    String modelUrl, name, description, colorCode;
    boolean autoRotate;
}
