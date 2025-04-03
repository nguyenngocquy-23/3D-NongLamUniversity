package vn.edu.hcmuaf.virtualnluapi.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Space {
    int id, fieldId;
    String name, description;
    byte status;
    LocalDateTime createdAt, updatedAt;
}
