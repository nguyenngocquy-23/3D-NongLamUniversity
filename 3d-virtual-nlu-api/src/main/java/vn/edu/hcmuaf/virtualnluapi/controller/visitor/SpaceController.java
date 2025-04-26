package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.service.SpaceService;

@Path("/space")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class SpaceController {
    @Inject
    SpaceService spaceService;

//    @POST
//    @Path("/avaiable")
//    @Produces(MediaType.APPLICATION_JSON)
//    public ApiResponse<List<SpaceResponse>> getSpaceAvailable() {
//        List<SpaceResponse> result = spaceService.getSpaceAvailble();
//        return ApiResponse.<List<SpaceResponse>>builder().statusCode(1000).message("Lay danh sach ten space thanh cong").data(result).build();
//    }
}
