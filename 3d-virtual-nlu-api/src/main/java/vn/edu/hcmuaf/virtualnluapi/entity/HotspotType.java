package vn.edu.hcmuaf.virtualnluapi.entity;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotspotType {
    byte id;
    String name;
    int defaultIconId;
    Timestamp updatedAt;
}
