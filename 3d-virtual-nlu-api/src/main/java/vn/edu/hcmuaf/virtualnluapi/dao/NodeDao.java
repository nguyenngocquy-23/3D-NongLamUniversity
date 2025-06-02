package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class NodeDao {

    @Inject
    HotspotDao hotspotDao;

    public List<NodeIdMapResponse> insertNode(List<NodeCreateRequest> reqs) {
        String sql = "INSERT INTO nodes (spaceId, userId, url, name, description, positionX, positionY, positionZ, lightIntensity, autoRotate, speedRotate, status) VALUES (:spaceId, :userId, :url, :name, :description, :positionX, :positionY, :positionZ, :lightIntensity, :autoRotate, :speedRotate, :status)";

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
                        .bind("lightIntensity", req.getLightIntensity())
                        .bind("autoRotate", req.getAutoRotate())
                        .bind("speedRotate", req.getSpeedRotate())
                        .bind("status", req.getStatus())
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
                 n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ, n.lightIntensity
                 FROM nodes n
                 JOIN spaces s ON n.spaceId = s.id
                 JOIN fields f ON s.fieldId = f.id
                 ORDER BY n.updatedAt DESC
                 LIMIT 10 OFFSET 0
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).mapToBean(NodeFullResponse.class).list());
    }

    public List<MasterNodeResponse> getAllMasterNodes() {
        String sql = """
                SELECT n.id, n.name, n.url
                FROM nodes n
                WHERE n.status = 2
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).mapToBean(MasterNodeResponse.class).list());
    }

    public NodeFullResponse getDefaultNode() {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ, n.lightIntensity
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

    public List<NodeFullResponse> getNodeByUser(UserIdRequest request) {
        String sql = """
                SELECT n.id, n.userId, s.id as spaceId, f.id as fieldId, n.name, n.description, n.url, n.updatedAt,
                n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ, n.lightIntensity
                FROM nodes n
                JOIN spaces s ON n.spaceId = s.id
                JOIN fields f ON s.fieldId = f.id
                WHERE n.userId = :userId
                ORDER BY n.updatedAt DESC
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .bind("userId", request.getUserId())
                .mapToBean(NodeFullResponse.class).list());
    }
}
