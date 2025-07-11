package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dao.SpaceDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceResponse;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class SpaceService {
    @Inject
    SpaceDao spaceDao;

    public boolean createSpace(SpaceCreateRequest req) {
        return spaceDao.insertSpace(req);
    }
    public List<SpaceResponse> getSpaceByFieldId(SpaceReadRequest req) {
        return spaceDao.getSpaceByFieldId(req);
    }

    public List<SpaceFullResponse> getAllSpaces(PageRequest request) {
        return spaceDao.getAllSpaces(request);
    }

    public SpaceFullResponse getSpaceById(SpaceIdRequest req) {
        return spaceDao.getSpaceById(req);
    }

    public boolean changeStatusSpaceMaster(StatusRequest req) {
        return spaceDao.changeStatusSpaceMaster(req);
    }

    public boolean changeStatusSpace(StatusRequest req) {
        return spaceDao.changeStatus(req);
    }


    public boolean changeNameSpace(SpaceChangeNameRequest req) {
        return spaceDao.changeNameSpace(req);
    }


    public boolean setMasterNode(SpaceChangeMasterRequest req) {
        return spaceDao.setMasterNode(req);
    }

    public boolean attachLocation(List<AttachLocationRequest> request) {
        return spaceDao.attachLocation(request);
    }

    public boolean removeLocation(SpaceIdRequest request) {
        return spaceDao.removeLocation(request);
    }


    public List<SpaceFullResponse> search(String searchKey) {
        try {
            return spaceDao.search(searchKey);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
