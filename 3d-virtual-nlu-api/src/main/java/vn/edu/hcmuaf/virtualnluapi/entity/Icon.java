package vn.edu.hcmuaf.virtualnluapi.entity;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Icon {
    int id;
    String url, name;
    boolean isActive;
    Timestamp createdAt;
}
