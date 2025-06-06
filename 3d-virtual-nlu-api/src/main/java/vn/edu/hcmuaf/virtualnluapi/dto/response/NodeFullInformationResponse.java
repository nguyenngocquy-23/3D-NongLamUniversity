package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NodeFullInformationResponse {
    int id;
    int spaceId, fieldId, userId;
    String spaceName, fieldName, userName;
    String url, name, description;
    double positionX, positionY, positionZ;
    byte status, autoRotate;
    double speedRotate, lightIntensity;
    LocalDateTime updatedAt;
    List<HotspotNavigationResponse> navHotspots;
    List<HotspotInformationResponse> infoHotspots;
    List<HotspotMediaResponse>  mediaHotspots;
    List<HotspotModelResponse> modelHotspots;
}
