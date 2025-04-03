package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SpaceCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SpaceReadRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Space;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class SpaceDao {

    @Inject
    FieldDao fieldDao;

    public boolean insertSpace(SpaceCreateRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("INSERT INTO spaces (fieldId, name, description, createdAt, updatedAt) VALUES (:fieldId, :name, :description, :createdAt, :updatedAt)")
                    .bind("fieldId", req.getFieldId())
                    .bind("name", req.getName())
                    .bind("description", req.getDescription())
                    .bind("createdAt", LocalDateTime.now())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public List<SpaceResponse> getSpaceByFieldId(SpaceReadRequest req) {
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery("SELECT id, name from spaces where fieldId = :fieldId")
                    .bind("fieldId", req.getFieldId())
                    .mapToBean(SpaceResponse.class)
                    .list();
        });
    }

    public List<SpaceFullResponse> getAllSpaces() {
        String sql = """
                SELECT f.name as fieldName, s.name, s.description, s.updatedAt
                 FROM spaces s
                 JOIN fields f ON s.fieldId = f.id
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .mapToBean(SpaceFullResponse.class)
                    .list();
        });
    }
}
