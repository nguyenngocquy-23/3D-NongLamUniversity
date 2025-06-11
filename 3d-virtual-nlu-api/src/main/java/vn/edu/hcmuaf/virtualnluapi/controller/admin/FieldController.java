package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.service.FieldService;

import java.util.List;

@Path("/admin/field")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@AllArgsConstructor
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class FieldController {
    @Inject
    FieldService fieldService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createField(FieldCreateRequest req) {
        boolean result = fieldService.createField(req);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Tao field thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi tao field").data(result).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<FieldResponse>> getFields() {
        List<FieldResponse> allFields = fieldService.getAllFields();
        return ApiResponse.<List<FieldResponse>>builder()
                .statusCode(1000)
                .message("Lay danh sach field thanh cong")
                .data(allFields)
                .build();
    }

    @POST
    @Path("/changeStatus")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> changeStatusField(StatusRequest req) {
        boolean result = fieldService.changeStatusField(req);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Thay doi trang thai field thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi thay doi trang thai field").data(result).build();
        }
    }
}
