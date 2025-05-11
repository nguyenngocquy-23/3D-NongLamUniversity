package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Entity;
import vn.edu.hcmuaf.virtualnluapi.dao.HotspotDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotMediaCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotModelCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotNavCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotMediaResponse;
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

    public List<HotspotModelResponse> getModelByNodeId(int nodeId) {
        return hotspotDao.getModelByNodeId(nodeId);
    }

    public boolean insertMedia(List<HotspotMediaCreateRequest> reqs) {
        return hotspotDao.insertHotspotMedia(reqs);
    }

    public List<HotspotMediaResponse> getMediaByNodeId(int nodeId) {
        return hotspotDao.getMediaByNodeId(nodeId);
    }
}
