package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.dao.CommentDao;
import vn.edu.hcmuaf.virtualnluapi.dao.IconDao;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.IconCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.DashboardResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;

import java.util.List;

@ApplicationScoped
public class DashboardService {
    @Inject
    private UserDao userDao;

    @Inject
    private CommentDao commentDao;

    @Inject
    private NodeDao nodeDao;

    public DashboardResponse statistical() {
        int numCurrentAccess = nodeDao.countAllView();
//        int numFreeAccess = userDao.countFreeAccess();
//        int numRegister = userDao.countRegisterUser();

        int numTour = nodeDao.countAllNodes();
        int numTourWaitingApprovel = nodeDao.countApprovingNodes();

        int numComment = commentDao.countAllComments();
//        int numReport = commentDao.countReports();

        return DashboardResponse.builder()
                .numCurrentAccess(numCurrentAccess)
                .numFreeAccess(23894)
                .numRegister(100)
                .numTour(numTour)
                .numTourWaitingApprovel(numTourWaitingApprovel)
                .numComment(numComment)
                .numReport(1)
                .build();
    }

}
