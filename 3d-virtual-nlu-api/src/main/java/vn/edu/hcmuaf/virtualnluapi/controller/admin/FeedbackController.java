package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FeedbackContactRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Feedback;
import vn.edu.hcmuaf.virtualnluapi.service.ContactService;
import vn.edu.hcmuaf.virtualnluapi.service.FeedbackService;

import java.util.List;

@Path("/v1/admin/feedback")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class FeedbackController {
    @Inject
    FeedbackService feedbackService;

    @GET
    @Path("/getAll")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<Feedback>> getAllFeedback() {
        List<Feedback> result = feedbackService.getAllFeedback();
        return ApiResponse.<List<Feedback>>builder().statusCode(1000).message("get danh sach noi dung phan hoi thanh cong").data(result).build();
    }
}
