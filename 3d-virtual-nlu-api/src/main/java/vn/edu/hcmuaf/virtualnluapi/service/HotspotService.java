package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dao.HotspotDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotMediaResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotModelResponse;

import java.time.LocalDateTime;
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

    public int updateNavHotspots(List<HotspotNavUpdateRequest> navHotspots, int nodeId) {
        return hotspotDao.updateNavHotspots(navHotspots, nodeId);
    }

    public int updateInfoHotspots(List<HotspotInfoUpdateRequest> infoHotspots, int nodeId) {
        return hotspotDao.updateInfoHotspots(infoHotspots, nodeId);
    }

    public int updateMediaHotspots(List<HotspotMediaUpdateRequest> mediaHotspots, int nodeId) {
        return hotspotDao.updateMediaHotspots(mediaHotspots, nodeId);
    }

    public int updateModelHotspots(List<HotspotModelUpdateRequest> modelHotspots, int id) {
        return hotspotDao.updateModelHotspots(modelHotspots, id);
    }

    public HotspotModelResponse getModelById(int hotspotId) {
        try {
            return hotspotDao.getModelById(hotspotId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<HotspotModelResponse> getAllModel(PageRequest reqs) {
        try {
            return hotspotDao.getAllModel(reqs);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean countDownloadModel(HotspotIdRequest reqs) {
        try {
            return hotspotDao.countDownloadModel(reqs);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<HotspotModelResponse> searchModel(String searchKey) {
        try {
            return hotspotDao.searchModel(searchKey);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public int getNumTotalModel() {
        try {
            return hotspotDao.getNumTotalModel();
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public int getNumDownloadModel(UserIdRequest reqs) {
        try {
            return hotspotDao.getNumDownloadModel(reqs);
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

}
