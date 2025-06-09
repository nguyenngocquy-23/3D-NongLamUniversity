package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserIdRequest;

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

    /**
     * Method : Nhận vào id của node Id. => Lấy ra danh sách các node liên quan dựa trên target của hotspot.
     * Điều kiện gọi API: Là master node. (Chứa tối đa 4 node con và các liên kết navigation sang các tour xung quanh khác)
     * => Danh sách preload sẽ gồm:
     * + 1. Danh sách các node con trong cùng 1 tour (tối đa 4).
     * + 2. Danh sách các master node của các tour khác có liên kết tới (không hạn chế).
     */

    @POST
    @Path("/preloadNodeList")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> getPreloadNodeList(NodeIdRequest node) {
        try {
            List<NodeFullResponse> result = nodeService.getListPreloadNodeByNode(node.getNodeId());

            return ApiResponse.<List<NodeFullResponse>>builder()
                    .statusCode(1000)
                    .message("Lấy danh sách node thành công")
                    .data(result)
                    .build();

        } catch (NumberFormatException e) {
            return ApiResponse.<List<NodeFullResponse>>builder()
                    .statusCode(1001)
                    .message("ID node không hợp lệ: " + node.getNodeId())
                    .data(null)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<List<NodeFullResponse>>builder()
                    .statusCode(1002)
                    .message("Đã xảy ra lỗi nội bộ: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }

    @POST
    @Path("/byId")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<NodeFullResponse> getNodeById(NodeIdRequest request) {
        NodeFullResponse result = nodeService.getNodeById(request);
        return ApiResponse.<NodeFullResponse>builder().statusCode(1000).message("Lay node theo id thanh cong").data(result).build();
    }

    @POST
    @Path("/byUser")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> getNodeByUser(UserIdRequest request) {
        List<NodeFullResponse> result = nodeService.getNodeByUser(request);
        return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Lay danh sach node theo nguoi tao thanh cong").data(result).build();
    }

    @POST
    @Path("/changeStatus")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> changeStatus(StatusRequest request) {
        boolean result = nodeService.changeStatus(request);
        return ApiResponse.<Boolean>builder().statusCode(1000).message("Cap nhat trang thai thanh cong").data(result).build();
    }
}