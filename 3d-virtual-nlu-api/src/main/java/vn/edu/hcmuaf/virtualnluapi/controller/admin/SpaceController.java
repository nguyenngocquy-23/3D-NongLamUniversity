package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SpaceCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SpaceReadRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceResponse;
import vn.edu.hcmuaf.virtualnluapi.service.SpaceService;

import java.util.List;

@Path("/admin/space")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class SpaceController {
    @Inject
    SpaceService spaceService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createSpace(SpaceCreateRequest req) {
        boolean result = spaceService.createSpace(req);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Tao space thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi tao space").data(result).build();
        }
    }

    @POST
    @Path("/byField")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<SpaceResponse>> getSpaceByFieldId(SpaceReadRequest req) {
        List<SpaceResponse> result = spaceService.getSpaceByFieldId(req);
        return ApiResponse.<List<SpaceResponse>>builder().statusCode(1000).message("Lay danh sach ten space thanh cong").data(result).build();
    }

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<SpaceFullResponse>> getAllSpaces() {
        List<SpaceFullResponse> result = spaceService.getAllSpaces();
        return ApiResponse.<List<SpaceFullResponse>>builder().statusCode(1000).message("Lay danh sach space thanh cong").data(result).build();
    }

    @POST
    @Path("/changeStatus")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> changeStatusField(StatusRequest req) {
        boolean result = spaceService.changeStatusSpace(req);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Thay doi trang thai field thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi thay doi trang thai field").data(result).build();
        }
    }
}
