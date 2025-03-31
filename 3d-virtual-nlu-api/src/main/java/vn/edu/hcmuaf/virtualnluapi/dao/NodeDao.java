package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;

import java.time.LocalDateTime;

@ApplicationScoped
public class NodeDao {

    public boolean insertNode(NodeCreateRequest req){
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("INSERT INTO nodes (spaceId, userId, url, name, description, createdAt, updatedAt) VALUES (:spaceId, :userId, :url, :name, :description, :createdAt, :updatedAt)")
                    .bind("spaceId", req.getSpaceId())
                    .bind("userId", req.getUserId())
                    .bind("url", req.getUrl())
                    .bind("name", req.getName())
                    .bind("description", req.getDescription())
                    .bind("createdAt", LocalDateTime.now())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }
}
