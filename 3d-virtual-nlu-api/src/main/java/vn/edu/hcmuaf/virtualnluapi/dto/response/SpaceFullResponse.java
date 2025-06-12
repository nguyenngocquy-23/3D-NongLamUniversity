package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpaceFullResponse {
    int id;
    int fieldId;
    String fieldName, code, name, masterNodeName, description, url, location;
    byte status;
    String tourIds;
    Timestamp createdAt, updatedAt;
}
