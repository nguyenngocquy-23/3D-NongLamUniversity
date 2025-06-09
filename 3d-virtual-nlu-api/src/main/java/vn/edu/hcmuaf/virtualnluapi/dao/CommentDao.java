package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
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
        String sql = """
                SELECT c.id, c.userId, u.username, u.avatar, c.nodeId, c.content, c.status, c.updatedAt
                FROM comments c 
                JOIN users u ON c.userId = u.id
                WHERE c.nodeId = :nodeId and c.status = 1 and parentId = 0
                ORDER BY c.updatedAt DESC
                """;
        List<CommentResponse> result = ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .bind("nodeId", request.getNodeId())
                    .mapToBean(CommentResponse.class)
                    .list();
        });
        for(CommentResponse comment: result){
            List<CommentResponse> replies = ConnectionPool.getConnection().withHandle(handle -> {
                return handle.createQuery("SELECT c.id, c.userId, u.username, u.avatar, c.nodeId, c.content, c.status, c.updatedAt " +
                                "FROM comments c JOIN users u ON c.userId = u.id " +
                                "WHERE c.parentId = :parentId AND c.status = 1 ORDER BY c.updatedAt DESC")
                        .bind("parentId", comment.getId())
                        .mapToBean(CommentResponse.class)
                        .list();
            });
            comment.setReplies(replies);
        }
        return result;
    }

    public boolean updateComment(UpdateCommentRequest request) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("UPDATE comments SET content = :content, updatedAt = :updatedAt WHERE id = :id")
                    .bind("content", request.getContent())
                    .bind("updatedAt", LocalDateTime.now())
                    .bind("id", request.getCommentId())
                    .execute();
            return i > 0;
        });
    }

    public boolean removeComment(CommentIdRequest request) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("UPDATE comments SET status = 0, updatedAt = :updatedAt WHERE id = :id")
                    .bind("updatedAt", LocalDateTime.now())
                    .bind("id", request.getCommentId())
                    .execute();
            return i > 0;
        });
    }
}
