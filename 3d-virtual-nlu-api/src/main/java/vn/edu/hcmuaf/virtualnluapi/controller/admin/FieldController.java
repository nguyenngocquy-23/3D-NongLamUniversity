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
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.service.FieldService;
import vn.edu.hcmuaf.virtualnluapi.service.NodeService;

import java.util.List;

@Path("/admin/field")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class FieldController {
    @Inject
    FieldService fieldService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createFied(FieldCreateRequest req) {
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
        return ApiResponse.<List<FieldResponse>>builder().statusCode(1000).message("Lay danh sach field thanh cong").data(fieldService.getFields()).build();
    }
}
