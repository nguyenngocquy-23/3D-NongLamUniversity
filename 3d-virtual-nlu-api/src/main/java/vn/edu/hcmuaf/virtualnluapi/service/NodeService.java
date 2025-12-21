package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.jdbi.v3.core.Handle;
import vn.edu.hcmuaf.virtualnluapi.config.CacheManager;
import vn.edu.hcmuaf.virtualnluapi.connection.HikariCP;
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

    @Inject
    CacheManager cache;

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
        return HikariCP.getJdbi().inTransaction(handle -> {

            try {

                List<NodeIdMapResponse> idCreated = nodeDao.insertNode(handle, reqs);
                Map<String, Integer> idMap = idCreated.stream().collect(Collectors.toMap(NodeIdMapResponse::getTempId, NodeIdMapResponse::getRealId));
                updatesIds(reqs, idMap);


                for (NodeCreateRequest req : reqs) {
                    insertHotspotsForNode(handle, req);
                }
                cache.clear(); // nếu nhiều key page
                return true;
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi tạo node hoặc hotspot", e); // Gây rollback
            }
        });
    }

    public List<NodeFullResponse> getNodesByPage(PageRequest request) {
        String key = "nodes:page:" + request.getPage()
                + ":limit:" + request.getLimit();

        List<NodeFullResponse> cached =
                cache.get(key, List.class);

        if (cached != null) {
            return cached;
        }

        List<NodeFullResponse> result =
                nodeDao.getNodesByPage(request);

        cache.put(key, result);
        return result;
    }

    public List<NodeFullResponse> getAllNodes() {
        String key = "nodes:all";

        List<NodeFullResponse> cached =
                cache.get(key, List.class);

        if (cached != null) {
            return cached;
        }

        List<NodeFullResponse> result =
                nodeDao.getAllNodes();

        cache.put(key, result);
        return result;
    }

    public List<NodeFullResponse> getAllMasterNodes(PageRequest request) {
        String key = "nodes:master:page:" + request.getPage()
                + ":size:" + request.getLimit();

        List<NodeFullResponse> cached =
                cache.get(key, List.class);

        if (cached != null) {
            return cached;
        }

        List<NodeFullResponse> result =
                nodeDao.getAllMasterNodes(request);

        cache.put(key, result);
        return result;
    }

    public NodeFullResponse getDefaultNode() {
        String key = "nodes:default";

        NodeFullResponse cached =
                cache.get(key, NodeFullResponse.class);

        if (cached != null) {
            return cached;
        }

        NodeFullResponse result =
                nodeDao.getDefaultNode();

        if (result != null) {
            cache.put(key, result);
        }

        return result;
    }

    public List<NodeFullResponse> getListPreloadNodeByNode(int nodeId) {
        String key = "node:preload:" + nodeId;

        List<NodeFullResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        List<NodeFullResponse> result =
                nodeDao.getListPreloadNodeByNode(nodeId);

        cache.put(key, result);
        return result;
    }

    public List<NodeExpandResponse> getNodeListByMasterId(int nodeId) {
        String key = "node:master:" + nodeId;

        List<NodeExpandResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }
        try {
            List<NodeExpandResponse> result =
                    nodeDao.getListNodeByMasterId(nodeId);

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    public List<NodeFullResponse> getNodeByUser(UserIdRequest request) {
        String key = "node:user:" + request.getUserId();

        List<NodeFullResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }
        try {
            List<NodeFullResponse> result =
                    nodeDao.getNodeByUser(request);
            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public NodeFullResponse getNodeById(NodeIdRequest request) {
        String key = "node:id:" + request.getNodeId();

        NodeFullResponse cached =
                cache.get(key, NodeFullResponse.class);
        if (cached != null) {
            return cached;
        }

        try {
            NodeFullResponse result =
                    nodeDao.getNodeById(request);

            if (result != null) {
                cache.put(key, result);
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean changeStatusAtomic(StatusRequest request) {
        return HikariCP.getJdbi().inTransaction(handle -> {
            boolean nodeResult = nodeDao.changeStatus(handle, request);
            boolean hotspotResult = true;

            if (request.getStatus() == 0) {
                hotspotResult = hotspotDao.changeStatusForHotspotNav(handle, request);
            }
            if (!nodeResult) {
                throw new RuntimeException("Failed to update both node and hotspot. Rollback.");
            }
            return true;
        });
    }

    public boolean remove(NodeIdRequest request) {
        boolean ok;
        try {
            ok = nodeDao.removeNode(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

        if (ok) {
            cache.invalidate("node:id:" + request.getNodeId());
            cache.clear();
        }
        return ok;
    }

    public List<NodeFullResponse> getPrivateNodeByUser(UserIdRequest request) {
        String key = "node:private:user:" + request.getUserId();

        List<NodeFullResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<NodeFullResponse> result =
                    nodeDao.getPrivateNodeByUser(request);

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<NodeFullResponse> getMasterNodeListBySpaceId(SpaceIdRequest request) {
        String key = "node:master:space:" + request.getSpaceId();

        List<NodeFullResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<NodeFullResponse> result =
                    nodeDao.getMasterNodeListBySpaceId(request);

            cache.put(key, result);
            return result;
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
//        return jdbi.inTrans
        return HikariCP.getJdbi().inTransaction(
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
                        cache.clear();
                        return true;
                    } catch (Exception e) {
                        throw new RuntimeException("Lỗi khi cập nhật nodes", e);
                    }

                }
        );
    }

    public List<NodeFullResponse> search(String searchKey) {
        String key = "node:search:" + searchKey.toLowerCase();

        List<NodeFullResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<NodeFullResponse> result = nodeDao.search(searchKey);
            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public boolean createAutoTour(AutoTourCreateRequest request) {
        boolean ok;
        try {
            ok = nodeDao.createAutoTour(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

        if (ok) {
            cache.clear(); // đơn giản + an toàn
        }
        return ok;
    }

    public List<AutoTourResponse> getAllAutoTour(PageRequest request) {
        String key = "autoTour:all:" + request.getPage() + ":" + request.getLimit();

        List<AutoTourResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<AutoTourResponse> result =
                    nodeDao.getAllAutoTour(request);

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<AutoTourResponse> getAutoTour(PageRequest request) {
        String key = "autoTour:public:" + request.getPage() + ":" + request.getLimit();

        List<AutoTourResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<AutoTourResponse> result =
                    nodeDao.getAutoTour(request);

            cache.put(key, result);
            return result;
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
        String key = "user:count:" + request.getUserId();

        Integer cached = cache.get(key, Integer.class);
        if (cached != null) {
            return cached;
        }

        try {
            int result = nodeDao.getNumOfUser(request);
            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public boolean updateNodePartial(int id, NodeUpdateOverviewRequest req) {
        return nodeDao.updateNodePartial(id, req);
    }

    public List<AutoTourResponse> searchAutoNode(String searchKey) {
        String key = "autoTour:search:" + searchKey.toLowerCase();

        List<AutoTourResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<AutoTourResponse> result =
                    nodeDao.searchAutoNode(searchKey);

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean updateAutoTour(AutoTourUpdateRequest request) {
        boolean ok;
        try {
            ok = nodeDao.updateAutoTour(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

        if (ok) {
            cache.clear();
        }
        return ok;
    }

    public boolean updateLinkNode(List<NodeLinkRequest> reqs) {
        boolean result = true;

        for (NodeLinkRequest req : reqs) {
            try {
                if (req.getNavHotspots() != null && !req.getNavHotspots().isEmpty()) {
                    boolean insertSuccess = hotspotService.insertNavigationForLinkNode(req.getNavHotspots(), req.getId());

                    if (!insertSuccess) {
                        System.err.println("Insert hotspot navigation failed for node: " + req.getId());
                        result = false;
                    }
                }
            } catch (Exception e) {
                System.err.println("Lỗi khi insert hotspot cho node: " + req.getId() + ": " + e.getMessage());
                e.printStackTrace();
                result = false;
            }
        }

        return result;
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

    public List<NodeFullResponse> getFailNodeByUser(UserIdRequest request) {
        String key = "node:fail:user:" + request.getUserId();

        List<NodeFullResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<NodeFullResponse> result =
                    nodeDao.getFailNodeByUser(request);

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}



