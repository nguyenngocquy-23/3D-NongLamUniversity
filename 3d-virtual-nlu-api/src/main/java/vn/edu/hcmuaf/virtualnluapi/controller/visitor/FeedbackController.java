package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FeedbackResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Feedback;
import vn.edu.hcmuaf.virtualnluapi.service.FeedbackService;

import java.util.List;

@Path("/feedback")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class FeedbackController {
    @Inject
    FeedbackService feedbackService;

    @POST
    @Path("/byId")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<FeedbackResponse> getFeedbackByNodeId(NodeIdRequest request) {
        FeedbackResponse result = feedbackService.getFeedbackByNodeId(request);
        return ApiResponse.<FeedbackResponse>builder().statusCode(1000).message("get danh sach noi dung phan hoi thanh cong").data(result).build();
    }
}
