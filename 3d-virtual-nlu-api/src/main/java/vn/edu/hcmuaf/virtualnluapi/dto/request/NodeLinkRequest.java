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


public class NodeLinkRequest {
    String id;
    List<HotspotNavCreateRequest> navHotspots;
}
