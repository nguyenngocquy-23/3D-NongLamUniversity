package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.ApproveTourRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Feedback;
import vn.edu.hcmuaf.virtualnluapi.service.ApproveTourService;
import vn.edu.hcmuaf.virtualnluapi.service.FeedbackService;

import java.util.List;

@Path("/v1/admin/approveTour")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ApproveTourController {
    @Inject
    ApproveTourService approveTourService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> approveTour(ApproveTourRequest request) {
        boolean result = approveTourService.approveTour(request);
        return ApiResponse.<Boolean>builder().statusCode(1000).message("duyet tour thanh cong").data(result).build();
    }
}
