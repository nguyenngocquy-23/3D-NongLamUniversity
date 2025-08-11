package vn.edu.hcmuaf.virtualnluapi.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class SpaceUpdateRequest {
    Integer fieldId, masterNodeId;
    String name, code, description, url;
    Byte status;
}
