package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.ContactDao;
import vn.edu.hcmuaf.virtualnluapi.dao.FeedbackDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FeedbackContactRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SendContactRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FeedbackResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Feedback;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class FeedbackService {
    @Inject
    FeedbackDao feedbackDao;

    public List<Feedback> getAllFeedback() {
        try {
            return feedbackDao.getAllFeedback();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public FeedbackResponse getFeedbackByNodeId(NodeIdRequest request) {
        try {
            return feedbackDao.getFeedbackByNodeId(request);
        } catch (Exception e) {
            e.printStackTrace();
            return FeedbackResponse.builder().build();
        }
    }
}
