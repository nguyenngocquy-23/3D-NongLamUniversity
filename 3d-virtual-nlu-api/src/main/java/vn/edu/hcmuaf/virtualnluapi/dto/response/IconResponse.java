package vn.edu.hcmuaf.virtualnluapi.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IconResponse {
    int id;
    String name, code, url;
    int isActive;
    int type;
    String thumbnail;
    Timestamp createdAt;
}
