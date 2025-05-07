package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Entity;
import vn.edu.hcmuaf.virtualnluapi.dao.HotspotDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotModelCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotNavCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotModelResponse;

import java.util.List;

@ApplicationScoped
public class HotspotService {

    @Inject
    private HotspotDao hotspotDao;

    public boolean insertOnlyNavigation(HotspotNavCreateRequest req) {
        return hotspotDao.insertHotspotNavigation(req);
    }

    public boolean insertModel(List<HotspotModelCreateRequest> req) {
        return hotspotDao.insertHotspotModel(req);
    }

    public boolean insertMutipleNavigation(List<HotspotNavCreateRequest> reqs) {
        return hotspotDao.insertHotspotNavigation(reqs);
    }

    public List<HotspotModelResponse> getModelByNodeId(NodeIdRequest reqs) {
        return hotspotDao.getModelByNodeId(reqs);
    }
}
