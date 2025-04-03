package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.service.NodeService;

import java.util.List;

@Path("/admin/node")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class NodeController {
    @Inject
    NodeService nodeService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createNode(NodeCreateRequest req) {
        boolean result = nodeService.createMainNode(req);
        if (result){
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Tao node thanh cong").data(result).build();
        } else{
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi tao node").data(result).build();
        }
    }

    @POST
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> getAllNodes() {
        List<NodeFullResponse> result = nodeService.getAllNodes();
        return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
    }
}
