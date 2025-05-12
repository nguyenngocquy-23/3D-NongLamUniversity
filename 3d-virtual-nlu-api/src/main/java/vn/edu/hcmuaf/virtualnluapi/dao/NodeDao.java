package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MasterNodeResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class NodeDao {

    public boolean insertNode(NodeCreateRequest req) {
        String sql = "INSERT INTO nodes (spaceId, userId, url, name, description, positionX, positionY, positionZ, lightIntensity, autoRotate, speedRotate, status) VALUES (:spaceId, :userId, :url, :name, :description, :positionX, :positionY, :positionZ, :lightIntensity, :autoRotate, :speedRotate, :status)";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate(sql)
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
                    .bind("status", req.getStatus()).execute();
            return i > 0;
        });
    }

    public List<NodeFullResponse> getAllNodes() {
        String sql = """
                 SELECT n.id, n.userId, s.name as spaceName, f.name as fieldName, n.name, n.description, n.url, n.updatedAt,
                 n.status, n.autoRotate, n.speedRotate, n.positionX, n.positionY, n.positionZ, n.lightIntensity
                 FROM nodes n
                 JOIN spaces s ON n.spaceId = s.id
                 JOIN fields f ON s.fieldId = f.id
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).mapToBean(NodeFullResponse.class).list());
    }

    public List<MasterNodeResponse> getAllMasterNodes() {
        String sql = """
                SELECT n.id, s.name as spaceName, n.url
                FROM nodes n
                JOIN spaces s ON n.spaceId = s.id
                WHERE n.status = 2
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).mapToBean(MasterNodeResponse.class).list());
    }
}
