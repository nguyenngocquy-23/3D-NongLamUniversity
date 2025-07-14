package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.CommentResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class ContactDao {

    public boolean sendContact(SendContactRequest req) {
        String sql = """
                INSERT INTO contacts (userId, email, content, status, createdAt) 
                VALUES (:userId, :email, :content, :status, :createdAt)
                """;
        return ConnectionPool.getConnection().inTransaction(handle -> {
            return handle.createUpdate(sql)
                    .bind("userId", req.getUserId())
                    .bind("email", req.getEmail())
                    .bind("content", req.getContent())
                    .bind("status", 0)
                    .bind("createdAt", LocalDateTime.now())
                    .execute() > 0;
        });
    }

    public List<ContactResponse> getAllContact() {
        String sql = """
                SELECT c.id, c.userId, c.email, c.content, c.status, c.createdAt 
                FROM contacts c
                ORDER BY c.createdAt DESC
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .mapToBean(ContactResponse.class)
                    .list();
        });
    }

    public Boolean feedback(FeedbackContactRequest request) {
        String sql = """
                UPDATE contacts 
                SET status = 1
                WHERE id = :id
                """;
        return ConnectionPool.getConnection().inTransaction(handle -> {
            return handle.createUpdate(sql)
                    .bind("id", request.getContactId())
                    .execute() > 0;
        });
    }
}
