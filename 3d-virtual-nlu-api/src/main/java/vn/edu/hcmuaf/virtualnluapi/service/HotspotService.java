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

//    public boolean insertOnlyNavigation(HotspotNavCreateRequest req) {
//        return hotspotDao.insertHotspotNavigation(req);
//    }

    public boolean insertNavigation(List<HotspotNavCreateRequest> reqs, String nodeId) {
        return hotspotDao.insertHotspotNavigation(reqs, nodeId);
    }

    //    public boolean insertInfomation(List<HotspotInfoCreateRequest> reqs) {
//        return hotspotDao.insert(reqs);
//    }
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
}
