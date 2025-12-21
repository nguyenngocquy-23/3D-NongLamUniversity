package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.HikariCP;
import vn.edu.hcmuaf.virtualnluapi.dto.request.MessageRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MessageResponse;

import java.sql.Timestamp;
import java.util.List;

@ApplicationScoped
public class MessageDao {

    public void insertMessage(MessageRequest messageDTO) {
        HikariCP.getJdbi().withHandle(handle -> {
            handle.createUpdate("INSERT INTO messages (userId, nodeId, content, createdAt) VALUES (:userId, :nodeId, :content, :createdAt)").bind("userId", messageDTO.getUserId()).bind("nodeId", messageDTO.getNodeId()).bind("content", messageDTO.getContent()).bind("createdAt", new Timestamp(System.currentTimeMillis())).execute();
            return null;
        });
    }

    public void deleteMessage(int messageId) {
        HikariCP.getJdbi();
        // delete message from database
    }

    public void updateMessage(int messageId, String content) {
        HikariCP.getJdbi();
        // update message in database
    }

    public void getMessage(int messageId) {
        HikariCP.getJdbi();
        // get message from database
    }

    public void getAllMessage(int nodeId) {
        HikariCP.getJdbi();
        // get all message from database
    }

    public List<MessageResponse> findMessages(int nodeId, int limit, int offset) {
        String sql = "SELECT * FROM messages WHERE nodeId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        return HikariCP.getJdbi().withHandle(handle -> handle.createQuery(sql)
                .bind(0, nodeId)
                .bind(1, limit)
                .bind(2, offset)
                .mapToBean(MessageResponse.class).list());
    }
}
