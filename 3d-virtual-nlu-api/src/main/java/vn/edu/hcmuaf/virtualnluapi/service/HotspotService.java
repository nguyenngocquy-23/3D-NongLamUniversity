package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.dao.HotspotDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotInfoCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotMediaCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotModelCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotNavCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotMediaResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotModelResponse;

import java.util.List;

@ApplicationScoped
public class HotspotService {

    @Inject
    private HotspotDao hotspotDao;

    public boolean insertNavigation(List<HotspotNavCreateRequest> reqs, String nodeId) {
        return hotspotDao.insertHotspotNavigation(reqs, nodeId);
    }

    public boolean insertInformation(List<HotspotInfoCreateRequest> reqs, String nodeId) {
        return hotspotDao.insertHotspotInformation(reqs, nodeId);
    }

    public boolean insertMedia(List<HotspotMediaCreateRequest> reqs, String nodeId) {
        return hotspotDao.insertHotspotMedia(reqs, nodeId);
    }

    public boolean insertModel(List<HotspotModelCreateRequest> req, String nodeId) {
        return hotspotDao.insertHotspotModel(req, nodeId);
    }


    public List<HotspotModelResponse> getModelByNodeId(int nodeId) {
        return hotspotDao.getModelByNodeId(nodeId);
    }


    public List<HotspotMediaResponse> getMediaByNodeId(int nodeId) {
        return hotspotDao.getMediaByNodeId(nodeId);
    }

    public int updateNavHotspots(List<HotspotNavCreateRequest> navHotspots, int id) {
        return hotspotDao.updateNavHotspots(navHotspots, id);
    }

    public int updateInfoHotspots(List<HotspotInfoCreateRequest> infoHotspots, int id) {
        return hotspotDao.updateInfoHotspots(infoHotspots, id);
    }

    public int updateMediaHotspots(List<HotspotMediaCreateRequest> mediaHotspots, int id) {
        return hotspotDao.updateMediaHotspots(mediaHotspots, id);
    }

    public int updateModelHotspots(List<HotspotModelCreateRequest> modelHotspots, int id) {
        return hotspotDao.updateModelHotspots(modelHotspots, id);
    }
}
