package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.connection.Connection;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.*;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class NodeDao {

    @Inject
    HotspotDao hotspotDao;
    @Inject
    private HotspotService hotspotService;

    public List<NodeIdMapResponse> insertNode(List<NodeCreateRequest> reqs) {
        String sql = """
                INSERT INTO nodes (spaceId, userId, url, name, description, positionX, positionY, positionZ, yawOffset, lightIntensity, autoRotate, speedRotate, status, numView) 
                VALUES (:spaceId, :userId, :url, :name, :description, :positionX, :positionY, :positionZ, :yawOffset, :lightIntensity, :autoRotate, :speedRotate, :status, :numView)""";

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
                        .bind("autoRotate", req.getAutoRotate())
                        .bind("speedRotate", req.getSpeedRotate())
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

    public List<NodeFullResponse> getAllNodes() {
        String sql = """
                 SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                 n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
                 FROM nodes n
                 JOIN spaces s ON n.spaceId = s.id
                 JOIN fields f ON s.fieldId = f.id
                 WHERE n.status IN (2,3)
                 ORDER BY n.updatedAt DESC
                 LIMIT 10 OFFSET 0
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).mapToBean(NodeFullResponse.class).list());
    }

    public List<NodeFullResponse> getAllMasterNodes(PageRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                 n.status, n.autoRotate, n.speedRotate, n.yawOffset, n.positionX, n.positionY, n.positionZ, n.lightIntensity
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
                n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
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


    public List<NodeFullResponse> getListNodeByMasterId(int nodeId) {
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

        List<NodeFullResponse> listNodesOfTour = new ArrayList<>();
        NodeFullResponse mainNode = getFullNodeByNodeId(nodeId);
        listNodesOfTour.add(mainNode);

        for (Integer i : targetNodeIds) {
            NodeFullResponse node = getFullNodeByNodeId(i);
            if (node != null) listNodesOfTour.add(node);
        }
        return listNodesOfTour;
    }
    /**
     * Trả về Full Response cho 1 node dựa vào Ids.
     */
    public NodeFullResponse getFullNodeByNodeId(int nodeId) {
        String sql = """
                SELECT id, spaceId, url , name, updatedAt, userId, description, status, positionX, positionY, positionZ, yawOffset,
                 autoRotate, speedRotate, lightIntensity
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

    public List<NodeFullResponse> getNodeByUser(UserIdRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
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
                n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ,n.yawOffset, n.lightIntensity
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
                n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ, n.yawOffset, n.lightIntensity
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
                n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ, n.yawOffset, n.lightIntensity
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
                positionY = :positionY, positionZ = :positionZ, yawOffset = :yawOffset, autoRotate = :autoRotate, speedRotate = :speedRotate,
                lightIntensity = :lightIntensity, status = :status, updatedAt = :updatedAt
                WHERE id = :id
                """;

        return ConnectionPool.getConnection().inTransaction(handle -> {
            for (NodeUpdateRequest req : reqs) {
                int rowsUpdated = handle.createUpdate(sql)
                        .bind("url", req.getUrl())
                        .bind("name", req.getName())
                        .bind("description", req.getDescription())
                        .bind("positionX", req.getPositionX())
                        .bind("positionY", req.getPositionY())
                        .bind("positionZ", req.getPositionZ())
                        .bind("yawOffset", req.getYawOffset())
                        .bind("autoRotate", req.getAutoRotate())
                        .bind("speedRotate", req.getSpeedRotate())
                        .bind("lightIntensity", req.getLightIntensity())
                        .bind("status", req.getStatus())
                        .bind("updatedAt", LocalDateTime.now())
                        .bind("id", req.getId())
                        .execute();
                int navUpdate = hotspotService.updateNavHotspots(req.getNavHotspots(), req.getId());
                int infoUpdate = hotspotService.updateInfoHotspots(req.getInfoHotspots(), req.getId());
                int mediaUpdate = hotspotService.updateMediaHotspots(req.getMediaHotspots(), req.getId());
                int modelUpdate = hotspotService.updateModelHotspots(req.getModelHotspots(), req.getId());
                if (rowsUpdated + navUpdate + infoUpdate + mediaUpdate + modelUpdate == 0) {
                    return false; // Nếu có bất kỳ bản ghi nào không được cập nhật, trả về false
                }
            }
            return true;
        });
    }
}
