package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dao.ApproveTourDao;
import vn.edu.hcmuaf.virtualnluapi.dao.FeedbackDao;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.ApproveTourRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.Feedback;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class ApproveTourService {
    @Inject
    ApproveTourDao approveTourDao;

    @Inject
    NodeDao nodeDao;

    @Inject
    MailService mailService;

    public boolean approveTour(ApproveTourRequest request) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            try {
                boolean changeStatus = false;
                if(request.getFeedbackList().equals("")){
                    changeStatus = nodeDao.changeStatus(handle, StatusRequest.builder()
                            .id(request.getNodeId())
                            .status((byte) 2)
                            .build());
                }else{
                    changeStatus = nodeDao.changeStatus(handle, StatusRequest.builder()
                            .id(request.getNodeId())
                            .status((byte) 4)
                            .build());
                }
                if(changeStatus){
                    if(request.getFeedbackList().equals("")){
                        mailService.sendMailApproveTourSuccess(request);
                        return true;
                    }else{
                        mailService.sendMailApproveTourFail(request);
                        return approveTourDao.approveTour(handle, request);
                    }
                }else{
                    return false;
                }
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        });
    }
}
