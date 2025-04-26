package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.HotspotType;
import vn.edu.hcmuaf.virtualnluapi.service.FieldService;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotTypeService;

import java.util.List;

@Path("/admin/hotspotType")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class HotspotTypeController {
    @Inject
    HotspotTypeService HotspotTypeService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<HotspotType>> getAllHotspotType() {
        List<HotspotType> allType = HotspotTypeService.getAllType();
        return ApiResponse.<List<HotspotType>>builder()
                .statusCode(1000)
                .message("Lay danh sach field thanh cong")
                .data(allType)
                .build();
    }
}
