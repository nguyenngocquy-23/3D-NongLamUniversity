package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeIdMapResponse;
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
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<List<NodeFullResponse>> getAllNodes() {
        List<NodeFullResponse> result = nodeService.getAllNodes();

        return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
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


}
