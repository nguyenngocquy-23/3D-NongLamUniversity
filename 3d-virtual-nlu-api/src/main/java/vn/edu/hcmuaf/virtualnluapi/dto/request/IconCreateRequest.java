package vn.edu.hcmuaf.virtualnluapi.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults( level = AccessLevel.PRIVATE)
public class IconCreateRequest {
    String name, iconUrl, type, thumbnail;
}
