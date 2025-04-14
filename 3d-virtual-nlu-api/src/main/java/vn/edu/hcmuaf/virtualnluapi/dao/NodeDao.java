package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class NodeDao {

    public boolean insertNode(NodeCreateRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("INSERT INTO nodes (spaceId, userId, url, name, description, positionX, positionY, positionZ, lightIntensity, autoRotate, speedRotate, status, createdAt, updatedAt) VALUES (:spaceId, :userId, :url, :name, :description, :positionX, :positionY, :positionZ, :lightIntensity, :autoRotate, :speedRotate, :status, :createdAt, :updatedAt)")
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
                    .bind("status", 1)
                    .bind("createdAt", LocalDateTime.now())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public List<NodeFullResponse> getAllNodes() {
        String sql = """
                 SELECT n.userId, s.name as spaceName, n.name, n.description, n.url, n.updatedAt
                 FROM nodes n
                 JOIN spaces s ON n.spaceId = s.id
                """;
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql).mapToBean(NodeFullResponse.class).list());
    }
}
