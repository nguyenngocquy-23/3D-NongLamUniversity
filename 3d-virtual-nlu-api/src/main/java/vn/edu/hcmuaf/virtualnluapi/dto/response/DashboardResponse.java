package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardResponse {
    int numCurrentAccess;
    int numFreeAccess;
    int numRegister;
    int numTour;
    int numComment;
    int numTourWaitingApprovel;
    int numReport;
}