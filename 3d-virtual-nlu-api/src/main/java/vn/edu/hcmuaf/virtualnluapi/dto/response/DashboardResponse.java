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
    int numMonthRegister;
    int numAllRegister;
    int numTour;
    int numAutoTour;
    int numComment;
    int numTourWaitingApprovel;
    int numField;
    int numSpace;
    int numContact;
    int highestViewNodeId;
    int lowestViewNodeId;
}