package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.CommentDao;
import vn.edu.hcmuaf.virtualnluapi.dao.SpaceDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.CommentResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceResponse;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class CommentService {
    @Inject
    CommentDao commentDao;

    public boolean insertComment(SendCommentRequest req) {
        try {
            return commentDao.insertComment(req);
        }catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<CommentResponse> getOfNode(NodeIdRequest request) {
        try {
            return commentDao.getOfNode(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean updateComment(UpdateCommentRequest request) {
        try {
            return commentDao.updateComment(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean removeComment(CommentIdRequest request) {
        try {
            return commentDao.removeComment(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
