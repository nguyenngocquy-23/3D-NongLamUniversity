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
public class NodeCreateRequest {
    int spaceId, userId;
    String url, name, description;
    double positionX, positionY, positionZ;
    byte autoRotate;
    double speedRotate, lightIntensity;
    byte status;

}
