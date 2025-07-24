package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.jdbi.v3.core.Handle;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dao.HotspotDao;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class NodeService {

    @Inject
    NodeDao nodeDao;

    @Inject
    HotspotDao hotspotDao;

    @Inject
    HotspotService hotspotService;


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

    public boolean createNode(List<NodeCreateRequest> reqs) {
        return ConnectionPool.getConnection().inTransaction(handle -> {

            try {

                List<NodeIdMapResponse> idCreated = nodeDao.insertNode(handle, reqs);
                Map<String, Integer> idMap = idCreated.stream().collect(Collectors.toMap(NodeIdMapResponse::getTempId, NodeIdMapResponse::getRealId));
                updatesIds(reqs, idMap);


                for (NodeCreateRequest req : reqs) {
                    insertHotspotsForNode(handle, req);
                }
                return true;
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi tạo node hoặc hotspot", e); // Gây rollback
            }
        });
    }


    public List<NodeFullResponse> getNodesByPage(PageRequest request) {
        return nodeDao.getNodesByPage(request);
    }

    public List<NodeFullResponse> getAllNodes() {
        return nodeDao.getAllNodes();
    }

    public List<NodeFullResponse> getAllMasterNodes(PageRequest request) {
        return nodeDao.getAllMasterNodes(request);
    }

    public NodeFullResponse getDefaultNode() {
        return nodeDao.getDefaultNode();
    }

    public List<NodeFullResponse> getListPreloadNodeByNode(int nodeId) {
        return nodeDao.getListPreloadNodeByNode(nodeId);
    }

    public List<NodeExpandResponse> getNodeListByMasterId(int nodeId) {
        return nodeDao.getListNodeByMasterId(nodeId);
    }


    public List<NodeFullResponse> getNodeByUser(UserIdRequest request) {
        try {
            return nodeDao.getNodeByUser(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public NodeFullResponse getNodeById(NodeIdRequest request) {
        try {
            return nodeDao.getNodeById(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean changeStatusAtomic(StatusRequest request) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            boolean nodeResult = nodeDao.changeStatus(handle, request);
            boolean hotspotResult = true;

            if (request.getStatus() == 0) {
                hotspotResult = hotspotDao.changeStatusForHotspotNav(handle, request);
            }
            if (!nodeResult || !hotspotResult) {
                throw new RuntimeException("Failed to update both node and hotspot. Rollback.");
            }
            return true;
        });
    }

    public boolean remove(NodeIdRequest request) {
        try {
            return nodeDao.removeNode(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<NodeFullResponse> getPrivateNodeByUser(UserIdRequest request) {
        try {
            return nodeDao.getPrivateNodeByUser(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<NodeFullResponse> getMasterNodeListBySpaceId(SpaceIdRequest request) {
        try {
            return nodeDao.getMasterNodeListBySpaceId(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }


    /**
     * Xử lý việc udpate node gồm 3 giai đoạn:
     * 1. Tạo node mới hoàn toàn.
     * <p>
     * <p>
     * 2. Xoá node mới (thay đổi status về 0)
     * <p>
     * 3. Cập nhật node mới.
     */
    public boolean updateNodes(NodeFullUpdateRequest reqs) {
        return ConnectionPool.getConnection().inTransaction(
                handle -> {

                    try {
                        if (reqs.getToDelete() != null && !reqs.getToDelete().isEmpty()) {
                            nodeDao.deleteNode(handle, reqs.getToDelete());
                        }
                        if (reqs.getToCreate() != null && !reqs.getToCreate().isEmpty()) {


                            List<NodeIdMapResponse> idCreate = nodeDao.insertNode(handle, reqs.getToCreate());
                            Map<String, Integer> idMap = idCreate.stream().collect(Collectors.toMap(NodeIdMapResponse::getTempId, NodeIdMapResponse::getRealId));
                            updatesIds(reqs.getToCreate(), idMap);
                            updateIdIntegerForUpdateNavHotspot(reqs.getToUpdate(), idMap); //Cập nhật targetNodeId

                            for (NodeCreateRequest req : reqs.getToCreate()) {
                                insertHotspotsForNode(handle, req);
                            }
                        }

                        if (reqs.getToUpdate() != null && !reqs.getToUpdate().isEmpty()) {
                            nodeDao.updateNodes(handle, reqs.getToUpdate());
                            for (NodeUpdateRequest req : reqs.getToUpdate()) {
                                updateHotspotsAfterNode(handle, req);
                            }
                        }
                        return true;


                    } catch (Exception e) {
                        throw new RuntimeException("Lỗi khi cập nhật nodes", e);
                    }

                }
        );
    }

    public List<NodeFullResponse> search(String searchKey) {
        try {
            return nodeDao.search(searchKey);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean createAutoTour(AutoTourCreateRequest request) {
        try {
            return nodeDao.createAutoTour(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<AutoTourResponse> getAutoTour(PageRequest request) {
        try {
            return nodeDao.getAutoTour(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean increaseView(List<NodeViewRequest> request) {
        try {
            return nodeDao.increaseView(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public int getNumOfUser(UserIdRequest request) {
        try {
            return nodeDao.getNumOfUser(request);
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public boolean updateNodePartial(int id, NodeUpdateOverviewRequest req) {
        return nodeDao.updateNodePartial(id, req);
    }

    public List<AutoTourResponse> searchAutoNode(String searchKey) {
        try {
            return nodeDao.searchAutoNode(searchKey);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean updateAutoTour(AutoTourUpdateRequest request) {
        try {
            return nodeDao.updateAutoTour(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


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
    private void updateIdIntegerForUpdateNavHotspot(List<NodeUpdateRequest> reqs, Map<String, Integer> idMapResponse) {
        for (NodeUpdateRequest req : reqs) {
            if (req.getNavHotspots() != null) {
                for (HotspotNavUpdateRequest navUpdateRequest : req.getNavHotspots()) {
                    String oldTarget = navUpdateRequest.getTargetNodeId();
                    if (idMapResponse.containsKey(oldTarget)) {
                        navUpdateRequest.setTargetNodeId(String.valueOf(idMapResponse.get(oldTarget)));
                    }
                }
            }
        }
    }


    /**
     * Insert Hotspot cho quá trình tạo tour.
     */
    private void insertHotspotsForNode(Handle handle, NodeCreateRequest req) {
        try {
            if (req.getNavHotspots() != null && !req.getNavHotspots().isEmpty()) {
                hotspotService.insertNavigation(handle, req.getNavHotspots(), req.getId());
            }
            if (req.getInfoHotspots() != null && !req.getInfoHotspots().isEmpty()) {
                hotspotService.insertInformation(handle, req.getInfoHotspots(), req.getId());
            }
            if (req.getMediaHotspots() != null && !req.getMediaHotspots().isEmpty()) {
                hotspotService.insertMedia(handle, req.getMediaHotspots(), req.getId());
            }
            if (req.getModelHotspots() != null && !req.getModelHotspots().isEmpty()) {
                hotspotService.insertModel(handle, req.getModelHotspots(), req.getId());
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi insert hotspot cho node: " + req.getId(), e);
        }
    }


    //Update hotspot cho quá trình update tour.
    private void updateHotspotsAfterNode(Handle handle, NodeUpdateRequest req) {

        try {
            int nodeId = Integer.parseInt(req.getId());

            if (req.getNavHotspots() != null) {
                hotspotService.updateNavHotspots(handle, req.getNavHotspots(), nodeId);
            }
            if (req.getInfoHotspots() != null) {
                hotspotService.updateInfoHotspots(handle, req.getInfoHotspots(), nodeId);
            }
            if (req.getMediaHotspots() != null) {
                hotspotService.updateMediaHotspots(handle, req.getMediaHotspots(), nodeId);
            }
            if (req.getModelHotspots() != null) {
                hotspotService.updateModelHotspots(handle, req.getModelHotspots(), nodeId);
            }


        } catch (NumberFormatException e) {
            throw new RuntimeException("Lỗi khi update hotspot cho node: " + req.getId(), e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi update hotspot cho node: " + req.getId(), e);
        }
    }
}



