package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.DashboardResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.service.DashboardService;
import vn.edu.hcmuaf.virtualnluapi.service.FieldService;
import vn.edu.hcmuaf.virtualnluapi.service.UserService;

import java.util.List;

@Path("/admin/dashboard")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@AllArgsConstructor
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class DashboardController {
    @Inject
    DashboardService dashboardService;
    @Inject
    UserService userService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<DashboardResponse> getDashboard(UserIdRequest request) {
        User user =  userService.findById(request.getUserId());
        DashboardResponse result = null;
        if (user != null) {
            result = dashboardService.statistical();
            return ApiResponse.<DashboardResponse>builder().statusCode(1000).message("Tao field thanh cong").data(result).build();
        } else {
            return ApiResponse.<DashboardResponse>builder().statusCode(5000).message("Loi tao field").data(result).build();
        }
    }
}
