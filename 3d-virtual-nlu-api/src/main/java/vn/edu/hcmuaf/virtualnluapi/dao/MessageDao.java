package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.MessageRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MessageResponse;

import java.sql.Timestamp;
import java.util.List;

@ApplicationScoped
public class MessageDao {

    public void insertMessage(MessageRequest messageDTO) {
        ConnectionPool.getConnection().withHandle(handle -> {
            handle.createUpdate("INSERT INTO messages (userId, nodeId, content, createdAt) VALUES (:userId, :nodeId, :content, :createdAt)").bind("userId", messageDTO.getUserId()).bind("nodeId", messageDTO.getNodeId()).bind("content", messageDTO.getContent()).bind("createdAt", new Timestamp(System.currentTimeMillis())).execute();
            return null;
        });
    }

    public void deleteMessage(int messageId) {
        ConnectionPool.getConnection();
        // delete message from database
    }

    public void updateMessage(int messageId, String content) {
        ConnectionPool.getConnection();
        // update message in database
    }

    public void getMessage(int messageId) {
        ConnectionPool.getConnection();
        // get message from database
    }

    public void getAllMessage(int nodeId) {
        ConnectionPool.getConnection();
        // get all message from database
    }

    public List<MessageResponse> findMessages(int nodeId, int limit, int offset) {
        String sql = "SELECT * FROM messages WHERE nodeId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        return ConnectionPool.getConnection().withHandle(handle -> handle.createQuery(sql)
                .bind(0, nodeId)
                .bind(1, limit)
                .bind(2, offset)
                .mapToBean(MessageResponse.class).list());
    }
}
