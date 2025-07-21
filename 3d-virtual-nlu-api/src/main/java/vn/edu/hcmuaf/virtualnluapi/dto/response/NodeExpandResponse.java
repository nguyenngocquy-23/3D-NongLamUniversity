package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NodeExpandResponse {
    int id;
    int spaceId, fieldId, userId;
    String url, name, description, spaceName, fieldName;
    double positionX, positionY, positionZ;
    double yawOffset;
    double lightIntensity, brightness, contrast, saturation, grayscale, exposure;
    byte status;
    Timestamp updatedAt;
    List<HotspotNavigationResponse> navHotspots;
    List<HotspotInformationResponse> infoHotspots;
    List<HotspotMediaResponse>  mediaHotspots;
    List<HotspotModelResponse> modelHotspots;
}
