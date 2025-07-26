package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FeedbackContactRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SendContactRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FeedbackResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Feedback;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class FeedbackDao {
    public List<Feedback> getAllFeedback() {
        String sql = """
                SELECT id, content 
                FROM feedbacks
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .mapToBean(Feedback.class)
                    .list();
        });
    }

    public FeedbackResponse getFeedbackByNodeId(NodeIdRequest request) {
        String sql = """
                SELECT feedbackList, moreFeedback, createdAt
                FROM approve_tours
                WHERE nodeId = :nodeId
                ORDER BY createdAt DESC
                LIMIT 1
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .bind("nodeId", request.getNodeId())
                    .mapToBean(FeedbackResponse.class)
                    .findOne()
                    .orElse(FeedbackResponse.builder().build());
        });
    }
}
