package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.service.FieldService;

import java.util.List;

@Path("/field")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@AllArgsConstructor
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class FieldController {
    @Inject
    FieldService fieldService;


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<FieldResponse>> getFieldsInVisitor() {
        List<FieldResponse> allFields = fieldService.getAllFieldsInVisitor();
        return ApiResponse.<List<FieldResponse>>builder()
                .statusCode(1000)
                .message("Lay danh sach field thanh cong")
                .data(allFields)
                .build();
    }





}
