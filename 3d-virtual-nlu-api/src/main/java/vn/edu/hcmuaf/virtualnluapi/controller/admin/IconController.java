package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.service.IconService;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Path("v1/admin/icon")
public class IconController {

    @Inject
    IconService iconService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<IconResponse>> getIcons() {
        List<IconResponse> allIcons = iconService.getAllIcons();
        return ApiResponse.<List<IconResponse>>builder()
                .statusCode(1000)
                .message("Lay danh sach icon thanh cong")
                .data(allIcons)
                .build();
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createIcon(IconCreateRequest req) {
        boolean result = iconService.createIcon(req);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Tao icon thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi tao icon").data(result).build();
        }
    }

    @POST
    @Path("/search")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<IconResponse>> searchField(SearchRequest request) {
        List<IconResponse> result = iconService.search(request.getSearchKey());
        return ApiResponse.<List<IconResponse>>builder().statusCode(1000).message("Tim kiem thanh cong").data(result).build();
    }

    @POST
    @Path("/changeStatus")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> changeStatusIcon(StatusRequest req) {
        boolean result = iconService.changeStatusIcon(req);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Thay doi trang thai icon thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi thay doi trang thai icon").data(result).build();
        }
    }

    @POST
    @Path("/changeName")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> changeNameIcon(ChangeNameRequest req) {
        try {
            boolean result = iconService.changeNameIcon(req);
            return ApiResponse.<Boolean>builder()
                    .statusCode(1000)
                    .message("Thay đổi tên icon thành công")
                    .data(result)
                    .build();
        } catch (IllegalStateException e) {
            return ApiResponse.<Boolean>builder()
                    .statusCode(5000)
                    .message("Lỗi thay đổi tên icon: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }
}
