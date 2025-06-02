package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MasterNodeResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeIdMapResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Space;

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

    public List<NodeFullResponse> getNodeByUser(UserIdRequest request) {
        try {
            return nodeDao.getNodeByUser(request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
