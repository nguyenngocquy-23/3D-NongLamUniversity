package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.*;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotService;
import vn.edu.hcmuaf.virtualnluapi.service.NodeService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("v1/admin/node")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class NodeController {
    @Inject
    NodeService nodeService;

    @Inject
    HotspotService hotspotService;

    @POST
    @Path("/insert")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createNode(List<NodeCreateRequest> reqs) {
        /**
         * Input: Insert danh sách node
         * Output: Trả về resultIdList:
         * [
         * {
         * tempId: id tạm trên NodeCreateRequest.
         * realId: id thực trong DB
         * }
         * ]
         */
        List<NodeIdMapResponse> resultIdList = nodeService.createNode(reqs);
        Map<String, Integer> idMap = resultIdList.stream().collect(Collectors.toMap(NodeIdMapResponse::getTempId, NodeIdMapResponse::getRealId));
        updatesIds(reqs, idMap);
        boolean result = true;
        for (NodeCreateRequest req : reqs) {
            try {
                if (req.getNavHotspots() != null && !req.getNavHotspots().isEmpty()) {
                    hotspotService.insertNavigation(req.getNavHotspots(), req.getId());
                }
                if (req.getInfoHotspots() != null && !req.getInfoHotspots().isEmpty()) {
                    hotspotService.insertInformation(req.getInfoHotspots(), req.getId());
                }
                if (req.getMediaHotspots() != null && !req.getMediaHotspots().isEmpty()) {
                    hotspotService.insertMedia(req.getMediaHotspots(), req.getId());
                }
                if (req.getModelHotspots() != null && !req.getModelHotspots().isEmpty()) {
                    hotspotService.insertModel(req.getModelHotspots(), req.getId());
                }
            } catch (Exception e) {
                System.err.println("Lỗi khi insert hotspot cho node: " + req.getId() + ": " + e.getMessage());
                result = false;
            }
        }

        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Tao node thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi tao node").data(result).build();
        }
    }

    @POST
    @Path("/createAutoTour")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createAutoTour(AutoTourCreateRequest request) {
        boolean result = nodeService.createAutoTour(request);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Tao node thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi tao node").data(result).build();
        }
    }

    @POST
    @Path("/update")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> updateNode(List<NodeUpdateRequest> reqs) {
        boolean result = false;
        try {
            result = nodeService.updateNodes(reqs);
            if (result) {
                return ApiResponse.<Boolean>builder()
                        .statusCode(1000)
                        .message("Cập nhật node thành công")
                        .data(result)
                        .build();
            } else {
                return ApiResponse.<Boolean>builder()
                        .statusCode(5000)
                        .message("Cập nhật node thất bại")
                        .data(result)
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<Boolean>builder()
                    .statusCode(5000)
                    .message("Cập nhật node thất bại: " + e.getMessage())
                    .data(result)
                    .build();
        }
    }

    @POST
    @Path("/search")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> searchNode(SearchRequest request) {
        List<NodeFullResponse> result = nodeService.search(request.getSearchKey());
        return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Tim kiem thanh cong").data(result).build();
    }

    @POST
    @Path("/masterNodeList")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> getMasterNodeListBySpaceId(SpaceIdRequest request) {
        List<NodeFullResponse> result = nodeService.getMasterNodeListBySpaceId(request);

        return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
    }

    @POST
    @Path("/byPage")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> getNodesByPage(PageRequest request) {
        List<NodeFullResponse> result = nodeService.getNodesByPage(request);

        return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
    }
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> getAllNodes() {
        List<NodeFullResponse> result = nodeService.getAllNodes();

        return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
    }

    @POST
    @Path("/getAutoTour")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<AutoTourResponse>> getAutoTour(PageRequest request) {
        List<AutoTourResponse> result = nodeService.getAutoTour(request);
        return ApiResponse.<List<AutoTourResponse>>builder().statusCode(1000).message("Lay danh sach tour tu dong thanh cong").data(result).build();
    }

    @POST
    @Path("/linkNode")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> updateLinkNode(List<NodeLinkRequest> reqs) {
        boolean result = true;
        for(NodeLinkRequest req : reqs) {
            try {
                if(req.getNavHotspots() != null && !req.getNavHotspots().isEmpty()) {
                    hotspotService.insertNavigation(req.getNavHotspots(), req.getId());
                }
            } catch (Exception e) {
                System.err.println("Lỗi khi insert hotspot cho node: " + req.getId() + ": " + e.getMessage());
                result = false;
            }
        }

        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Cập nhật thành công").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Lỗi cập nhật").data(result).build();
        }
    }


    /**
     * Method này dành cho việc cập nhật dữ liệu trong tour (tổng quan)
     * @param id : id của master node.
     * @param request
     * Các trường được update ở dạng động:
     * 1. name : Update name cho thằng master, đồng thời những thằng con sẽ update thành _1, _2.
     * 2. spaceId: Cập nhật toàn bộ tour với spaceId mới nhất.
     * 3. description: Chỉ cập nhật mô tả cho  master node.
     * 4. trạng thái: chỉ cập nhật trạng thái cho  master node
     *
     * @return boolean
     */
    @PATCH
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)

    public ApiResponse<List<NodeExpandResponse>> updateNodeOverviewById(@PathParam("id") int id, NodeUpdateOverviewRequest request) {

        boolean result = nodeService.updateNodePartial(id, request);
        if (result) {
            List<NodeExpandResponse> updatedList = nodeService.getNodeListByMasterId(id);
            return ApiResponse.<List<NodeExpandResponse>>builder().statusCode(1000).message("Cập nhật thành công!").data(updatedList).build();
        } else {
            return ApiResponse.<List<NodeExpandResponse>>builder().statusCode(5000).message("Cập nhật thất bại!").data(null).build();
        }

    }

    /**
     * Method dùng để thay thế realId trong Dabatabase cho:
     * 1. tempId của node.
     * 2. targetNodeId (temp) của hotspot trong node.
     * idMapResponse:
     * + String: id temp tạo bằng nanoId đang gán trong biến tempId của mỗi NodeCreateRequest.
     * + Interger: id thật, sau khi insert nó sẽ trả về id trong database.
     */
    private void updatesIds(List<NodeCreateRequest> reqs, Map<String, Integer> idMapResponse) {
        for (NodeCreateRequest req : reqs) {
            if (idMapResponse.containsKey(req.getTempId())) {
                req.setId(String.valueOf(idMapResponse.get(req.getTempId()))); // Parse giá trị của idMapResponse (realId: int) vè id (string).
            }
            if (req.getNavHotspots() != null) {
                for (HotspotNavCreateRequest navCreateRequest : req.getNavHotspots()) {
                    String oldTarget = navCreateRequest.getTargetNodeId();
                    if (idMapResponse.containsKey(oldTarget)) {
                        navCreateRequest.setTargetNodeId(String.valueOf(idMapResponse.get(oldTarget)));
                    }
                }
            }
        }
    }

    @POST
    @Path("/changeStatus")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> changeStatusNode(StatusRequest req) {
        boolean result = nodeService.changeStatus(req);
        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("Thay doi trang thai space thanh cong").data(result).build();
        } else {
            return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi thay doi trang thai space").data(result).build();
        }
    }

}
