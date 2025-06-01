package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SendCommentRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.CommentResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class CommentDao {

    public boolean insertComment(SendCommentRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("INSERT INTO comments (userId, nodeId, parentId, content, status, createdAt, updatedAt) VALUES (:userId, :nodeId, :parentId, :content, :status, :createdAt, :updatedAt)")
                    .bind("userId", req.getUserId())
                    .bind("nodeId", req.getNodeId())
                    .bind("parentId", req.getParentId())
                    .bind("content", req.getContent())
                    .bind("status", 1)
                    .bind("createdAt", LocalDateTime.now())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public List<CommentResponse> getOfNode(NodeIdRequest request) {
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery("SELECT id, userId, nodeId, parentId, content, status, updatedAt FROM comments WHERE nodeId = :nodeId ORDER BY updatedAt DESC")
                    .bind("nodeId", request.getNodeId())
                    .mapToBean(CommentResponse.class)
                    .list();
        });
    }
}
