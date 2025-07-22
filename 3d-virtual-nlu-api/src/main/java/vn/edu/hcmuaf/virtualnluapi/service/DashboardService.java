package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.dao.*;
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
    @Inject
    private FieldDao fieldDao;
    @Inject
    private SpaceDao spaceDao;

    public DashboardResponse statistical() {
        int numCurrentAccess = nodeDao.countAllView();
//        int numFreeAccess = userDao.countFreeAccess();
//        int numRegister = userDao.countRegisterUser();

        int numTour = nodeDao.countAllNodes();
        int numAutoTour = nodeDao.countAllAutoNodes();
        int numTourWaitingApprovel = nodeDao.countApprovingNodes();

        int numComment = commentDao.countAllComments();
//        int numReport = commentDao.countReports();

        int numField = fieldDao.countAllFields();
        int numSpace = spaceDao.countAllSpaces();

        return DashboardResponse.builder()
                .numCurrentAccess(numCurrentAccess)
                .numFreeAccess(23894)
                .numRegister(100)
                .numAutoTour(numAutoTour)
                .numTour(numTour)
                .numTourWaitingApprovel(numTourWaitingApprovel)
                .numComment(numComment)
                .numReport(1)
                .numField(numField)
                .numSpace(numSpace)
                .build();
    }

}
