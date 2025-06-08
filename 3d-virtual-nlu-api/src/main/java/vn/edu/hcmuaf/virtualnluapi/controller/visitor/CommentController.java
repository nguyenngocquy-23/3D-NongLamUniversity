package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SendCommentRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.CommentResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MasterNodeResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.service.CommentService;
import vn.edu.hcmuaf.virtualnluapi.service.NodeService;

import java.util.List;

@Path("/comment")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class CommentController {
    @Inject
    CommentService commentService;

    @POST
    @Path("/send")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> insertComment(SendCommentRequest request) {
        boolean result = commentService.insertComment(request);
        return ApiResponse.<Boolean>builder().statusCode(1000).message("Binh luan thanh cong").data(result).build();
    }

    @POST
    @Path("/getOfNode")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<CommentResponse>> getOfNode(NodeIdRequest request) {
        List<CommentResponse> result = commentService.getOfNode(request);
        return ApiResponse.<List<CommentResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
    }
}
