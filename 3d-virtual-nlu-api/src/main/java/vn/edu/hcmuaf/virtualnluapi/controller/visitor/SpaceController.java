package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.service.SpaceService;

import java.util.List;

@Path("/space")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class SpaceController {
    @Inject
    SpaceService spaceService;


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<SpaceFullResponse>> getAllSpacesInVisitor() {
        List<SpaceFullResponse> result = spaceService.getAllSpacesInVisitor();
        return ApiResponse.<List<SpaceFullResponse>>builder().statusCode(1000).message("Lay danh sach space thanh cong").data(result).build();
    }

}
