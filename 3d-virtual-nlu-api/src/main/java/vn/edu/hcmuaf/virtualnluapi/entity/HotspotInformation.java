package vn.edu.hcmuaf.virtualnluapi.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotspotInformation extends Hotspot{
    String title;
    String content;
}
