package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import org.jdbi.v3.core.Handle;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.ApproveTourRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SendCommentRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.Feedback;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class ApproveTourDao {
    public boolean approveTour(Handle handle, ApproveTourRequest request) {
        String sql = """
                INSERT INTO approve_tours (nodeId, feedbackList, moreFeedback, createdAt) 
                VALUES (:nodeId, :feedbackList, :moreFeedback, :createdAt)
                """;
        return handle.createUpdate(sql)
                    .bind("nodeId", request.getNodeId())
                    .bind("feedbackList", request.getFeedbackList())
                    .bind("moreFeedback", request.getMoreFeedback())
                    .bind("createdAt", LocalDateTime.now())
                    .execute() > 0;
    }
}
