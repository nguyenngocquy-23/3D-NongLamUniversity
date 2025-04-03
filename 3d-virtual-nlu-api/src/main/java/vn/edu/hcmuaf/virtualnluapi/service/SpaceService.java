package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dao.SpaceDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SpaceCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SpaceReadRequest;
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
}
