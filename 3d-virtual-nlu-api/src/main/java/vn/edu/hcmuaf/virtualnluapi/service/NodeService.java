package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.NodeDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.Space;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class NodeService {
    @Inject
    NodeDao nodeDao;

    public boolean createMainNode(NodeCreateRequest req) {
        return nodeDao.insertNode(req);
    }
}
