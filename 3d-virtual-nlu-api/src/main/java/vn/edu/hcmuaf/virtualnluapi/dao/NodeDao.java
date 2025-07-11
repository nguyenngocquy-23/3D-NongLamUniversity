package vn.edu.hcmuaf.virtualnluapi.dao;

import com.nimbusds.jose.shaded.gson.Gson;
import com.nimbusds.jose.shaded.gson.reflect.TypeToken;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jdbi.v3.core.statement.PreparedBatch;
import vn.edu.hcmuaf.virtualnluapi.connection.Connection;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.*;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class NodeDao {

    @Inject
    HotspotDao hotspotDao;
    @Inject
    private HotspotService hotspotService;

    public List<NodeIdMapResponse> insertNode(List<NodeCreateRequest> reqs) {
        String sql = """
                INSERT INTO nodes (spaceId, userId, url, name, description, positionX, positionY, positionZ, yawOffset, lightIntensity, brightness, contrast, saturation, grayscale, exposure, status, numView) 
                VALUES (:spaceId, :userId, :url, :name, :description, :positionX, :positionY, :positionZ, :yawOffset, :lightIntensity, :brightness, :contrast, :saturation, :grayscale, :exposure, :status, :numView)""";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            List<NodeIdMapResponse> idMapResponses = new ArrayList<>();

            for (NodeCreateRequest req : reqs) {

                int realId = handle.createUpdate(sql)
                        .bind("spaceId", req.getSpaceId())
                        .bind("userId", req.getUserId())
                        .bind("url", req.getUrl())
                        .bind("name", req.getName())
                        .bind("description", req.getDescription())
                        .bind("positionX", req.getPositionX())
                        .bind("positionY", req.getPositionY())
                        .bind("positionZ", req.getPositionZ())
                        .bind("yawOffset", req.getYawOffset())
                        .bind("lightIntensity", req.getLightIntensity())
                        .bind("brightness", req.getBrightness())
                        .bind("contrast", req.getContrast())
                        .bind("saturation", req.getSaturation())
                        .bind("grayscale", req.getGrayscale())
                        .bind("exposure", req.getExposure())
                        .bind("status", req.getStatus())
                        .bind("numView", 0)
                        .executeAndReturnGeneratedKeys("id")
                        .mapTo(int.class)
                        .one();

                idMapResponses.add(new NodeIdMapResponse(req.getId(), realId));
            }
            return idMapResponses;
        });
    }

    public List<NodeFullResponse> getAllNodes(PageRequest request) {
        String sql = """
                 SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                 n.status, n.brightness, n.contrast, n.saturation, n.grayscale, n.exposure, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
                 FROM nodes n
                 JOIN spaces s ON n.spaceId = s.id
                 JOIN fields f ON s.fieldId = f.id
                 WHERE n.status = 2
                 ORDER BY n.updatedAt DESC
                 LIMIT :limit OFFSET :offset
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).bind("limit", request.getLimit()).bind("offset", request.getPage() * request.getLimit()).mapToBean(NodeFullResponse.class).list());
    }

    public int countAllNodes() {
        String sql = "SELECT COUNT(*) FROM nodes WHERE status = 2";
        return ConnectionPool.getConnection().withHandle(handle ->
                handle.createQuery(sql)
                        .mapTo(int.class)
                        .one()
        );
    }

    public int countApprovingNodes() {
        String sql = "SELECT COUNT(*) FROM nodes WHERE status = 3 or status = 4";
        return ConnectionPool.getConnection().withHandle(handle ->
                handle.createQuery(sql)
                        .mapTo(int.class)
                        .one()
        );
    }

    public List<NodeFullResponse> getAllMasterNodes(PageRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                 n.status, n.brightness, n.contrast, n.saturation, n.grayscale, n.exposure, n.yawOffset, n.positionX, n.positionY, n.positionZ, n.lightIntensity
                 FROM nodes n
                 JOIN spaces s ON n.spaceId = s.id
                 JOIN fields f ON s.fieldId = f.id
                 WHERE n.status = 2
                 ORDER BY n.updatedAt DESC
                 LIMIT :limit OFFSET :page
                """;
        List<NodeFullResponse> result = ConnectionPool.getConnection().withHandle(handle ->
                handle.createQuery(sql)
                        .bind("limit", request.getLimit())
                        .bind("page", request.getPage() * request.getLimit())
                        .mapToBean(NodeFullResponse.class)
                        .list()
        );
        for (NodeFullResponse n : result) {
            List<HotspotNavigationResponse> navigationResponses = hotspotDao.getNavigationByNodeId(n.getId());
            List<HotspotInformationResponse> informationResponses = hotspotDao.getInformationByNodeId(n.getId());
            List<HotspotMediaResponse> mediaResponses = hotspotDao.getMediaByNodeId(n.getId());
            List<HotspotModelResponse> modelResponses = hotspotDao.getModelByNodeId(n.getId());
            n.setNavHotspots(navigationResponses);
            n.setInfoHotspots(informationResponses);
            n.setMediaHotspots(mediaResponses);
            n.setModelHotspots(modelResponses);
        }
        return result;
    }

    public NodeFullResponse getDefaultNode() {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
                FROM nodes n
                JOIN spaces s ON n.spaceId = s.id
                JOIN fields f ON s.fieldId = f.id
                WHERE s.status = 2 AND n.id = s.masterNodeId    
                """;
        NodeFullResponse nodeFullResponse = ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .mapToBean(NodeFullResponse.class).one());
        if (nodeFullResponse == null) {
            return null;
        }
        List<HotspotMediaResponse> mediaHotspots = hotspotDao.getMediaByNodeId(nodeFullResponse.getId());
        List<HotspotModelResponse> modelHotspots = hotspotDao.getModelByNodeId(nodeFullResponse.getId());
        List<HotspotNavigationResponse> navigationHotspots = hotspotDao.getNavigationByNodeId(nodeFullResponse.getId());
        List<HotspotInformationResponse> informationHotspots = hotspotDao.getInformationByNodeId(nodeFullResponse.getId());

        nodeFullResponse.setNavHotspots(navigationHotspots);
        nodeFullResponse.setInfoHotspots(informationHotspots);
        nodeFullResponse.setMediaHotspots(mediaHotspots);
        nodeFullResponse.setModelHotspots(modelHotspots);
        return nodeFullResponse;
    }

    /**
     * Input: Nhận vào node id (node id của master node).
     * Lấy ra danh sách targetNodeId dựa vào hotspot navigation.
     * => Lấy ra danh sách node full response dựa vào đó.
     */

    public List<NodeFullResponse> getListPreloadNodeByNode(int nodeId) {
        /**
         * Truy xuất sql cho danh sách targetNodeId dựa vào hotspot navigation..
         */
        String getTargetNodeIdSQL = " SELECT hn.targetNodeId FROM hotspots h JOIN hotspot_navigations hn ON h.id = hn.hotspotId" +
                " WHERE h.nodeId = :nodeId AND h.type = 1";

        List<Integer> targetNodeIds = ConnectionPool.getConnection().withHandle(
                handle -> handle.createQuery(getTargetNodeIdSQL)
                        .bind("nodeId", nodeId)
                        .mapTo(Integer.class)
                        .list()
        );

        if (targetNodeIds == null || targetNodeIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<NodeFullResponse> preloadNodes = new ArrayList<>();
        for (Integer i : targetNodeIds) {
            NodeFullResponse node = getFullNodeByNodeId(i);
            if (node != null) preloadNodes.add(node);

        }
        return preloadNodes;

    }

    /**
     * NodeByMasterId:Lấy ra danh sách các node có chung (đơn vị là tour khởi tạo).
     * @param nodeId : master node của 1 tour.
     * @return
     * + Thông tin hoàn chỉnh của master node kèm theo các node con.
     * + Thông tin hotspot. => Lấy kèm thêm node có targetNode là hotspot nhưng nó là không gian khác nên chỉ hiển thị không thể click
     *
     */

    public List<NodeFullResponse> getListNodeByMasterId(int nodeId) {
        /**
         * Truy xuất sql cho danh sách targetNodeId dựa vào hotspot navigation..
         */
        String getTargetNodeIdSQL = """
              SELECT hn.targetNodeId FROM hotspots h JOIN hotspot_navigations hn ON h.id = hn.hotspotId 
                WHERE h.nodeId = :nodeId AND h.type = 1
                """;

        String getNodeStatusSQL = """
                SELECT id, status FROM nodes WHERE id IN (<ids>)
                
                """;

        //Danh sách targetNodeId.
        List<Integer> targetNodeIds = ConnectionPool.getConnection().withHandle(
                handle -> handle.createQuery(getTargetNodeIdSQL)
                        .bind("nodeId", nodeId)
                        .mapTo(Integer.class)
                        .list()
        );

        if (targetNodeIds == null || targetNodeIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<NodeStatusResponse> nodesWithStatus = ConnectionPool.getConnection().withHandle(
                handle -> handle.createQuery(getNodeStatusSQL).bindList("ids", targetNodeIds)
                        .map((rs, ctx) -> new NodeStatusResponse(rs.getInt("id"),
                                rs.getByte("status")
                        )).list()
        );

        List<NodeFullResponse> listNodesOfTour = new ArrayList<>();
        NodeFullResponse mainNode = getFullNodeByNodeId(nodeId);
        listNodesOfTour.add(mainNode);

        for(NodeStatusResponse item : nodesWithStatus) {
            if(item.getStatus() == 1) {
                NodeFullResponse node = getFullNodeByNodeId(item.getId());
                if(node !=null) listNodesOfTour.add(node);
            } else if (item.getStatus() == 2) {
                NodeFullResponse node = getCustomNodeByNodeId(item.getId());
                if(node != null) listNodesOfTour.add(node);
            }

        }
        return listNodesOfTour;
    }
    /**
     * Trả về Full Response cho 1 node dựa vào Ids.
     */
    public NodeFullResponse getFullNodeByNodeId(int nodeId) {
        String sql = """
                SELECT id, spaceId, url , name, updatedAt, userId, description, status, positionX, positionY, positionZ, yawOffset,
                  brightness, contrast, saturation, grayscale, exposure, lightIntensity
                FROM nodes 
                WHERE id = :nodeId
                """;
        NodeFullResponse nodeFullResponse = ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .bind("nodeId", nodeId)
                .mapToBean(NodeFullResponse.class).one());
        if (nodeFullResponse == null) {
            return null;
        }
        List<HotspotMediaResponse> mediaHotspots = hotspotDao.getMediaByNodeId(nodeFullResponse.getId());
        List<HotspotModelResponse> modelHotspots = hotspotDao.getModelByNodeId(nodeFullResponse.getId());
        List<HotspotNavigationResponse> navigationHotspots = hotspotDao.getNavigationByNodeId(nodeFullResponse.getId());
        List<HotspotInformationResponse> informationHotspots = hotspotDao.getInformationByNodeId(nodeFullResponse.getId());

        nodeFullResponse.setNavHotspots(navigationHotspots);
        nodeFullResponse.setInfoHotspots(informationHotspots);
        nodeFullResponse.setMediaHotspots(mediaHotspots);
        nodeFullResponse.setModelHotspots(modelHotspots);
        return nodeFullResponse;
    }

    /**
     * Không lấy danh sách hotspot con. Tất cả Rỗng.
     */
    public NodeFullResponse getCustomNodeByNodeId(int nodeId) {
        String sql = """
                SELECT id, spaceId, url , name, updatedAt, userId, description, status, positionX, positionY, positionZ, yawOffset,
                   brightness, contrast, saturation, grayscale, exposure, lightIntensity
                FROM nodes 
                WHERE id = :nodeId
                """;
        NodeFullResponse nodeFullResponse = ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .bind("nodeId", nodeId)
                .mapToBean(NodeFullResponse.class).one());
        if (nodeFullResponse == null) {
            return null;
        }
        return nodeFullResponse;
    }


    public List<NodeFullResponse> getNodeByUser(UserIdRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status, n.brightness, n.contrast, n.saturation, n.grayscale, n.exposure, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
                FROM nodes n
                JOIN spaces s ON n.spaceId = s.id
                JOIN fields f ON s.fieldId = f.id
                WHERE n.userId = :userId and (n.status = 2 or n.status = 0)
                ORDER BY n.updatedAt DESC
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .bind("userId", request.getUserId())
                .mapToBean(NodeFullResponse.class).list());
    }

    public NodeFullResponse getNodeById(NodeIdRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status, n.brightness, n.contrast, n.saturation, n.grayscale, n.exposure, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
                FROM nodes n
                JOIN spaces s ON n.spaceId = s.id
                JOIN fields f ON s.fieldId = f.id
                WHERE n.id = :nodeId
                """;
        NodeFullResponse nodeFullResponse = ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .bind("nodeId", request.getNodeId())
                .mapToBean(NodeFullResponse.class).one());
        if (nodeFullResponse == null) {
            return null;
        }
        List<HotspotMediaResponse> mediaHotspots = hotspotDao.getMediaByNodeId(nodeFullResponse.getId());
        List<HotspotModelResponse> modelHotspots = hotspotDao.getModelByNodeId(nodeFullResponse.getId());
        List<HotspotNavigationResponse> navigationHotspots = hotspotDao.getNavigationByNodeId(nodeFullResponse.getId());
        List<HotspotInformationResponse> informationHotspots = hotspotDao.getInformationByNodeId(nodeFullResponse.getId());

        nodeFullResponse.setNavHotspots(navigationHotspots);
        nodeFullResponse.setInfoHotspots(informationHotspots);
        nodeFullResponse.setMediaHotspots(mediaHotspots);
        nodeFullResponse.setModelHotspots(modelHotspots);
        return nodeFullResponse;
    }

    public boolean changeStatus(StatusRequest request) {
        String sql = "UPDATE nodes SET status = :status, updatedAt = :updatedAt WHERE id = :nodeId";
        int rowsUpdated = ConnectionPool.getConnection().withHandle(handle -> handle.createUpdate(sql)
                .bind("status", request.getStatus() == 0 ? 2 : 0)
                .bind("updatedAt", LocalDateTime.now())
                .bind("nodeId", request.getId())
                .execute());
        return rowsUpdated > 0;
    }

    public boolean removeNode(NodeIdRequest request) {
        String sql = "UPDATE nodes SET status = -1, updatedAt = :updatedAt WHERE id = :nodeId";
        int rowsUpdated = ConnectionPool.getConnection().withHandle(handle -> handle.createUpdate(sql)
                .bind("updatedAt", LocalDateTime.now())
                .bind("nodeId", request.getNodeId())
                .execute());
        return rowsUpdated > 0;
    }

    public List<NodeFullResponse> getPrivateNodeByUser(UserIdRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status,  n.brightness, n.contrast, n.saturation, n.grayscale, n.exposure, n.positionX, n.positionY, n.positionZ, n.yawOffset, n.lightIntensity
                FROM nodes n
                JOIN spaces s ON n.spaceId = s.id
                JOIN fields f ON s.fieldId = f.id
                WHERE n.userId = :userId and n.status = 3
                ORDER BY n.updatedAt DESC
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .bind("userId", request.getUserId())
                .mapToBean(NodeFullResponse.class).list());
    }

    public List<NodeFullResponse> getMasterNodeListBySpaceId(SpaceIdRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status, n.brightness, n.contrast, n.saturation, n.grayscale, n.exposure, n.positionX, n.positionY, n.positionZ, n.yawOffset, n.lightIntensity
                FROM nodes n
                JOIN spaces s ON n.spaceId = s.id
                JOIN fields f ON s.fieldId = f.id
                WHERE n.spaceId = :spaceId and n.status IN (0,2,3)
                """;
        return ConnectionPool.getConnection().withHandle(handle ->
        {
            List<NodeFullResponse> nodes = handle.createQuery(sql)
                    .bind("spaceId", request.getSpaceId())
                    .mapToBean(NodeFullResponse.class).list();
            for (NodeFullResponse n : nodes) {
                List<HotspotNavigationResponse> navigationResponses = hotspotDao.getNavigationByNodeId(n.getId());
                List<HotspotInformationResponse> informationResponses = hotspotDao.getInformationByNodeId(n.getId());
                List<HotspotMediaResponse> mediaResponses = hotspotDao.getMediaByNodeId(n.getId());
                List<HotspotModelResponse> modelResponses = hotspotDao.getModelByNodeId(n.getId());
                n.setNavHotspots(navigationResponses);
                n.setInfoHotspots(informationResponses);
                n.setMediaHotspots(mediaResponses);
                n.setModelHotspots(modelResponses);
            }
            return nodes;
        });
    }

    public boolean updateNodes(List<NodeUpdateRequest> reqs) {
        String sql = """
                UPDATE nodes SET url = :url, name = :name, description = :description, positionX = :positionX,
                positionY = :positionY, positionZ = :positionZ, yawOffset = :yawOffset, brightness = :brightness, contrast = :contrast,
                saturation = :saturation, grayscale = :grayscale, exposure = :exposure,
                lightIntensity = :lightIntensity, status = :status, updatedAt = :updatedAt
                WHERE id = :id
                """;

        int totalNodeUpdated = ConnectionPool.getConnection().inTransaction(handle -> {
            int count = 0;
            for (NodeUpdateRequest req : reqs) {
                count += handle.createUpdate(sql)
                        .bind("url", req.getUrl())
                        .bind("name", req.getName())
                        .bind("description", req.getDescription())
                        .bind("positionX", req.getPositionX())
                        .bind("positionY", req.getPositionY())
                        .bind("positionZ", req.getPositionZ())
                        .bind("yawOffset", req.getYawOffset())
                        .bind("brightness", req.getBrightness())
                        .bind("contrast", req.getContrast())
                        .bind("saturation", req.getSaturation())
                        .bind("grayscale", req.getGrayscale())
                        .bind("exposure", req.getExposure())
                        .bind("lightIntensity", req.getLightIntensity())
                        .bind("status", req.getStatus())
                        .bind("updatedAt", LocalDateTime.now())
                        .bind("id", req.getId())
                        .execute();
            }
            return count;
        });

        // Sau khi cập nhật nodes xong → cập nhật hotspots
        for (NodeUpdateRequest req : reqs) {
            int navUpdate = hotspotService.updateNavHotspots(req.getNavHotspots(), req.getId());
            int infoUpdate = hotspotService.updateInfoHotspots(req.getInfoHotspots(), req.getId());
            int mediaUpdate = hotspotService.updateMediaHotspots(req.getMediaHotspots(), req.getId());
            int modelUpdate = hotspotService.updateModelHotspots(req.getModelHotspots(), req.getId());

            int totalHotspotUpdated = navUpdate + infoUpdate + mediaUpdate + modelUpdate;

            // Nếu node không được update và các hotspot không thay đổi → fail
            if (totalNodeUpdated == 0 && totalHotspotUpdated == 0) {
                return false;
            }
        }
        return true;
    }

    public List<NodeFullResponse> search(String searchKey) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                 n.status, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
                 FROM nodes n
                 JOIN spaces s ON n.spaceId = s.id
                 JOIN fields f ON s.fieldId = f.id
                 WHERE LOWER(n.name) LIKE :searchKey and n.status = 2
                 ORDER BY n.updatedAt DESC
                 LIMIT 10
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).bind("searchKey", "%" + searchKey.toLowerCase() + "%").mapToBean(NodeFullResponse.class).list());
    }

    public boolean createAutoTour(AutoTourCreateRequest request) {
        String sql = """
                INSERT INTO auto_tours (userId, name, indexNode, status, soundBackground, createdAt, updatedAt)
                VALUES (:userId, :name, :indexNode, :status, :soundBackground, :createdAt, :updatedAt)
                """;

        try {
            Boolean result = ConnectionPool.getConnection().inTransaction(handle -> {
                int inserted = handle.createUpdate(sql)
                        .bind("userId", request.getUserId())
                        .bind("name", request.getName())
                        .bind("indexNode", request.getIndexNode())
                        .bind("status", 1)
                        .bind("soundBackground", request.getSoundBackground())
                        .bind("createdAt", LocalDateTime.now())
                        .bind("updatedAt", LocalDateTime.now())
                        .execute();
                return inserted > 0;
            });

            return Boolean.TRUE.equals(result); // Tránh NullPointer
        } catch (Exception e) {
            e.printStackTrace(); // Log lỗi chi tiết nếu cần
            return false;
        }
    }

    public List<AutoTourResponse> getAutoTour(PageRequest request) {
        String sql = """
                SELECT at.id, at.name, at.indexNode, at.soundBackground , at.status, at.updatedAt
                FROM auto_tours at
                ORDER BY at.updatedAt DESC
                LIMIT :limit OFFSET :offset
                """;

        return ConnectionPool.getConnection().withHandle(handle -> {
            List<AutoTourResponse> result = handle.createQuery(sql)
                    .bind("limit", request.getLimit())
                    .bind("offset", request.getPage() * request.getLimit())
                    .mapToBean(AutoTourResponse.class)
                    .list();

            // Gọi service lấy URL theo nodeId đầu tiên trong indexNode
            for (AutoTourResponse item : result) {
                try {
                    Gson gson = new Gson();
                    List<Map<String, Object>> indexList = gson.fromJson(
                            item.getIndexNode(),
                            new TypeToken<List<Map<String, Object>>>() {
                            }.getType()
                    );

                    if (!indexList.isEmpty()) {
                        Number nodeIdNum = (Number) indexList.get(0).get("nodeId");
                        int firstNodeId = nodeIdNum.intValue(); // Ép kiểu đúng

                        String url = getNodeById(NodeIdRequest.builder().nodeId(firstNodeId).build()).getUrl();

                        item.setThumbNail(url);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            return result;
        });
    }

    public boolean increaseView(List<NodeViewRequest> requests) {
        String sql = """
                    UPDATE nodes
                    SET numView = numView + :numView
                    WHERE id = :id
                """;

        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch batch = handle.prepareBatch(sql);

            for (NodeViewRequest req : requests) {
                batch.bind("id", req.getNodeId())
                        .bind("numView", req.getNumView())
                        .add();
            }

            int[] results = batch.execute();
            return results.length == requests.size(); // đảm bảo đủ lượt update
        });
    }

    public int getNumOfUser(UserIdRequest request) {
        String sql = "SELECT SUM(numView) FROM nodes WHERE userId = :userId";
        return ConnectionPool.getConnection().withHandle(handle ->
                handle.createQuery(sql)
                        .bind("userId", request.getUserId())
                        .mapTo(int.class)
                        .one()
        );
    }

    public int countAllView() {
        String sql = "SELECT SUM(numView) FROM nodes";
        return ConnectionPool.getConnection().withHandle(handle ->
                handle.createQuery(sql)
                        .mapTo(int.class)
                        .one()
        );
    }
}
