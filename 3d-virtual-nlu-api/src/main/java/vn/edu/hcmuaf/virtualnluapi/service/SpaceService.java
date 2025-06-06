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
    public List<SpaceFullResponse> getAllSpaces() {
        return spaceDao.getAllSpaces();
    }

    public boolean changeStatusSpace(StatusRequest req) {
        return spaceDao.changeStatusSpace(req);
    }


    public boolean attachLocation(List<AttachLocationRequest> request) {
        return spaceDao.attachLocation(request);
    }

    public boolean removeLocation(SpaceIdRequest request) {
        return spaceDao.removeLocation(request);
    }
}
