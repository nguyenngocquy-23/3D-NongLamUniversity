package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MasterNodeResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeIdMapResponse;
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

    public List<NodeFullResponse> getAllNodes() {
        return nodeDao.getAllNodes();
    }

    public List<MasterNodeResponse> getAllMasterNodes() {
        return nodeDao.getAllMasterNodes();
    }

    public NodeFullResponse getDefaultNode() {
        return nodeDao.getDefaultNode();
    }

    public List<NodeFullResponse> getListPreloadNodeByNode(int nodeId) {
        return nodeDao.getListPreloadNodeByNode(nodeId);
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

    public boolean remoev(NodeIdRequest request) {
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
    public List<NodeFullResponse> getMasterNodeListBySpaceId (SpaceIdRequest request) {
        try {
            return nodeDao.getMasterNodeListBySpaceId(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

}
