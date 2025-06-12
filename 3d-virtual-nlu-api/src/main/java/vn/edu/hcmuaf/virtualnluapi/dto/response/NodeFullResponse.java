package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotInfoCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotMediaCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotModelCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotNavCreateRequest;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NodeFullResponse {
    int id;
    int spaceId, fieldId, userId;
    String url, name, description;
    double positionX, positionY, positionZ;
    byte status, autoRotate;
    double speedRotate, lightIntensity;
    Timestamp updatedAt;
    List<HotspotNavigationResponse> navHotspots;
    List<HotspotInformationResponse> infoHotspots;
    List<HotspotMediaResponse>  mediaHotspots;
    List<HotspotModelResponse> modelHotspots;
}
