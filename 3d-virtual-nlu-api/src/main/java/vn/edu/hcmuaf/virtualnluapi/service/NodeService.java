package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.AutoTourResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MasterNodeResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeIdMapResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeImageResponse;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class NodeService {

    @Inject
    NodeDao nodeDao;

    public List<NodeIdMapResponse> createNode(List<NodeCreateRequest> reqs) {
        return nodeDao.insertNode(reqs);
    }

    public List<NodeFullResponse> getNodesByPage(PageRequest request) {
        return nodeDao.getNodesByPage(request);
    }

    public List<NodeFullResponse> getAllNodes() {
        return nodeDao.getAllNodes();
    }

    public List<NodeFullResponse> getAllMasterNodes(PageRequest request) {
        return nodeDao.getAllMasterNodes(request);
    }

    public NodeFullResponse getDefaultNode() {
        return nodeDao.getDefaultNode();
    }

    public List<NodeFullResponse> getListPreloadNodeByNode(int nodeId) {
        return nodeDao.getListPreloadNodeByNode(nodeId);
    }

    public List<NodeFullResponse> getNodeListByMasterId(int nodeId) {
        return nodeDao.getListNodeByMasterId(nodeId);
    }


    public List<NodeFullResponse> getNodeByUser(UserIdRequest request) {
        try {
            return nodeDao.getNodeByUser(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public NodeFullResponse getNodeById(NodeIdRequest request) {
        try {
            return nodeDao.getNodeById(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean changeStatus(StatusRequest request) {
        try {
            return nodeDao.changeStatus(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean remove(NodeIdRequest request) {
        try {
            return nodeDao.removeNode(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<NodeFullResponse> getPrivateNodeByUser(UserIdRequest request) {
        try {
            return nodeDao.getPrivateNodeByUser(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<NodeFullResponse> getMasterNodeListBySpaceId(SpaceIdRequest request) {
        try {
            return nodeDao.getMasterNodeListBySpaceId(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

    public boolean updateNodes(List<NodeUpdateRequest> reqs) {
        try {
            return nodeDao.updateNodes(reqs);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<NodeFullResponse> search(String searchKey) {
        try {
            return nodeDao.search(searchKey);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean createAutoTour(AutoTourCreateRequest request) {
        try {
            return nodeDao.createAutoTour(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<AutoTourResponse> getAutoTour(PageRequest request) {
        try {
            return nodeDao.getAutoTour(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean increaseView(List<NodeViewRequest> request) {
        try {
            return nodeDao.increaseView(request);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public int getNumOfUser(UserIdRequest request) {
        try {
            return nodeDao.getNumOfUser(request);
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public NodeFullResponse updateNodePartial(int id, NodeUpdateOverviewRequest req) {
        return nodeDao.updateNodePartial(id, req);
    }

}
