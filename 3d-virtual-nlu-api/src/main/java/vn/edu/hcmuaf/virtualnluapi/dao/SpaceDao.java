package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jdbi.v3.core.statement.PreparedBatch;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.SpaceResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.Space;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class SpaceDao {

    @Inject
    FieldDao fieldDao;

    public boolean insertSpace(SpaceCreateRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate(
                            "INSERT INTO spaces (fieldId, name, code, description, url, status, createdAt, updatedAt) VALUES (:fieldId, :name, :code, :description, :url, :status, :createdAt, :updatedAt)")
                    .bind("fieldId", req.getFieldId())
                    .bind("name", req.getName())
                    .bind("code", req.getCode())
                    .bind("description", req.getDescription())
                    .bind("status", 1)
                    .bind("url", req.getUrl())
                    .bind("createdAt", LocalDateTime.now())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public List<SpaceResponse> getSpaceByFieldId(SpaceReadRequest req) {
        return ConnectionPool.getConnection().withHandle(handle -> {

            return handle
                    .createQuery("SELECT id, name from spaces where fieldId = :fieldId and status = 1 or status = 2")
                    .bind("fieldId", req.getFieldId())
                    .mapToBean(SpaceResponse.class)
                    .list();
        });
    }

    public List<SpaceFullResponse> getAllSpaces(PageRequest request) {
        String spaceSql = """
                SELECT s.id, f.name as fieldName, s.fieldId, s.code, s.name, s.description, s.url, s.status, s.location, s.masterNodeId, n.name as masterNodeName
                , s.createdAt, s.updatedAt
                FROM spaces s
                JOIN fields f ON s.fieldId = f.id
                LEFT JOIN nodes n ON s.masterNodeId = n.id
                LIMIT :limit OFFSET :offset
                """;

        return ConnectionPool.getConnection().withHandle(handle -> {
            // Lấy danh sách spaces
            return handle.createQuery(spaceSql)
                    .bind("limit", request.getLimit())
                    .bind("offset", request.getPage() * request.getLimit())
                    .mapToBean(SpaceFullResponse.class)
                    .list();

        });
    }

    public SpaceFullResponse getSpaceById(SpaceIdRequest request) {
        String spaceSql = """
                SELECT s.id, f.name as fieldName, s.fieldId, s.code, s.name, s.description, s.url, s.status, s.location, s.masterNodeId, n.name as masterNodeName
                , s.createdAt, s.updatedAt
                FROM spaces s
                JOIN fields f ON s.fieldId = f.id
                JOIN nodes n ON s.masterNodeId = n.id
                WHERE s.id = :id
                """;

        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(spaceSql)
                    .bind("id", request.getSpaceId())
                    .mapToBean(SpaceFullResponse.class)
                    .one();

        });
    }


    /**
     * Dành cho việc cập nhật trạng thái cho space chính trong không gian (hiển thị mặc định.
     *
     * @param req : id & status mới.
     * @return
     */
    public boolean changeStatusSpaceMaster(StatusRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            // Bước 1: Cập nhật tất cả status = 2 về 1
            handle.createUpdate("UPDATE spaces SET status = 1 WHERE status = 2")
                    .execute();

            // Bước 2: Đặt status = 2 cho space hiện tại
            int updated = handle.createUpdate("UPDATE spaces SET status = 2 WHERE id = :id")
                    .bind("id", req.getId())
                    .execute();

            return updated > 0; // chỉ cần 1 bản ghi được cập nhật là thành công
        });
    }


    public boolean changeStatus(StatusRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("UPDATE spaces SET status = :status, updatedAt = :updatedAt WHERE id = :id")
                    .bind("status", req.getStatus())
                    .bind("id", req.getId())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public boolean changeNameSpace(ChangeNameRequest req) {
        String updateSql = "UPDATE spaces SET name = :name, code = :code, updatedAt = :updatedAt WHERE id = :id";
        return ConnectionPool.getConnection().inTransaction(
                handle -> {
                    int i = handle.createUpdate(updateSql)
                            .bind("name", req.getName()
                            )
                            .bind("code", req.getCode())
                            .bind("id", req.getId())
                            .bind("updatedAt", LocalDateTime.now())
                            .execute();
                    if (i == 0) {
                        throw new IllegalStateException("Không thể thay đổi, id có thể sai!");
                    }
                    return i > 0;
                }
        );
    }


    public boolean setMasterNode(SpaceChangeMasterRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int updated = handle.createUpdate("UPDATE spaces SET masterNodeId = :masterNodeId WHERE id = :spaceId")
                    .bind("masterNodeId", req.getMasterNodeId())
                    .bind("spaceId", req.getId())
                    .execute();

            return updated > 0;
        });
    }

    public boolean attachLocation(List<AttachLocationRequest> requestList) {
        String sql = "UPDATE spaces SET location = :location WHERE id = :id";

        try {
            return ConnectionPool.getConnection().inTransaction(handle -> {
                PreparedBatch batch = handle.prepareBatch(sql);
                for (AttachLocationRequest req : requestList) {
                    batch.bind("id", req.getSpaceId())
                            .bind("location", req.getLocation())
                            .add();
                }
                batch.execute(); // thực thi batch
                return true; // cần return để inTransaction hợp lệ
            });
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean removeLocation(SpaceIdRequest request) {
        String sql = "UPDATE spaces SET location = NULL WHERE id = :id";

        try {
            return ConnectionPool.getConnection().inTransaction(handle -> {
                int i = handle.createUpdate(sql)
                        .bind("id", request.getSpaceId())
                        .execute();
                return i > 0;
            });
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public int countAllSpaces() {
        String sql = "SELECT COUNT(*) FROM spaces";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .mapTo(Integer.class)
                    .one();
        });
    }

    public List<SpaceFullResponse> search(String searchKey) {
        String searchSql = """
                SELECT s.id, f.name as fieldName, s.fieldId, s.code, s.name, s.description, s.url, s.status, s.location, s.masterNodeId, n.name as masterNodeName
                , s.createdAt, s.updatedAt
                FROM spaces s
                JOIN fields f ON s.fieldId = f.id
                LEFT JOIN nodes n ON s.masterNodeId = n.id
                WHERE s.name LIKE :searchKey OR s.code LIKE :searchKey
                """;
        try {
            return ConnectionPool.getConnection().withHandle(handle -> {
                return handle.createQuery(searchSql)
                        .bind("searchKey", "%" + searchKey + "%")
                        .mapToBean(SpaceFullResponse.class)
                        .list();
            });
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
