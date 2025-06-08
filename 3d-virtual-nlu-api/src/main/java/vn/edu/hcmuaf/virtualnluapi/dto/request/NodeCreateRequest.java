package vn.edu.hcmuaf.virtualnluapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class NodeCreateRequest {
    String id;
    String tempId;
    int spaceId, userId;
    String url, name, description;
    double positionX, positionY, positionZ;
    byte autoRotate;
    double speedRotate, lightIntensity;
    byte status;
    List<HotspotNavCreateRequest> navHotspots;
    List<HotspotInfoCreateRequest> infoHotspots;
    List<HotspotMediaCreateRequest>  mediaHotspots;
    List<HotspotModelCreateRequest> modelHotspots;
 }
