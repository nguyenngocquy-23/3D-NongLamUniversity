package vn.edu.hcmuaf.virtualnluapi.entity;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotspotMedia extends Hotspot{
    String mediaType, mediaUrl, caption;
}
