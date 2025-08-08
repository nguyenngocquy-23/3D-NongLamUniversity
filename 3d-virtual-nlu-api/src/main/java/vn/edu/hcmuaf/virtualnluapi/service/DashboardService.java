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
    @Inject
    private ContactDao contactDao;

    public DashboardResponse statistical() {
        int numCurrentAccess = nodeDao.countAllView();
//        int numFreeAccess = userDao.countFreeAccess();
        int numMonthRegister = userDao.countMonthRegister();
        int numAllRegister = userDao.countAllRegister();
//        int highestViewNodeId = nodeDao.getHighestNumViewOfNode();
//        int lowestViewNodeId = nodeDao.getLowestNumViewOfNode();

        int numTour = nodeDao.countAllNodes();
        int numAutoTour = nodeDao.countAllAutoNodes();
        int numTourWaitingApprovel = nodeDao.countApprovingNodes();

        int numComment = commentDao.countAllComments();

        int numField = fieldDao.countAllFields();
        int numSpace = spaceDao.countAllSpaces();
        int numContact = contactDao.countAllContact();

        return DashboardResponse.builder()
                .numCurrentAccess(numCurrentAccess)
                .numFreeAccess(230)
                .numMonthRegister(numMonthRegister)
                .numAllRegister(numAllRegister)
                .numAutoTour(numAutoTour)
                .numTour(numTour)
                .numTourWaitingApprovel(numTourWaitingApprovel)
                .numComment(numComment)
                .numField(numField)
                .numSpace(numSpace)
                .numContact(numContact)
//                .highestViewNodeId(highestViewNodeId)
//                .lowestViewNodeId(lowestViewNodeId)
                .build();
    }

}
