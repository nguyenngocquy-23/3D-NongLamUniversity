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
public class NodeUpdateRequest {
    int id;
    String url, name, description;
    double positionX, positionY, positionZ;
    byte autoRotate;
    double speedRotate, lightIntensity;
    byte status;
    List<HotspotNavUpdateRequest> navHotspots;
    List<HotspotInfoUpdateRequest> infoHotspots;
    List<HotspotMediaUpdateRequest>  mediaHotspots;
    List<HotspotModelUpdateRequest> modelHotspots;
 }
