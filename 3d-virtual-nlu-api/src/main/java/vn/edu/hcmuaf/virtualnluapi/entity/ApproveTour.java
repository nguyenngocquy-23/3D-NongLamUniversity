package vn.edu.hcmuaf.virtualnluapi.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApproveTour {
    int id;
    int nodeId;
    String feedbackList, moreFeedback;
    Timestamp createdAt;
}
