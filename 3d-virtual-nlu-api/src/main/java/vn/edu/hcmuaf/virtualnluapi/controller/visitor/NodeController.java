package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MasterNodeResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.service.NodeService;

import java.util.List;

@Path("/node")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class NodeController {
    @Inject
    NodeService nodeService;

    @POST
    @Path("/master")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<MasterNodeResponse>> getAllMasterNodes() {
        List<MasterNodeResponse> result = nodeService.getAllMasterNodes();
        return ApiResponse.<List<MasterNodeResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
    }

    @POST
    @Path("/default")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<NodeFullResponse> getDefaultNode() {
        NodeFullResponse result = nodeService.getDefaultNode();
        return ApiResponse.<NodeFullResponse>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
    }
}
