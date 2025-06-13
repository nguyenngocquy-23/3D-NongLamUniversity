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

    /**
     * TourIds là 1 mảng JSON chứa id của tất cả các nodes có status = 2 ~
     * masternode đại diện cho 1 tour.
     * + 0 đang tạm ngưng
     * +2 đang hiển thị bình thường.
     * + 3 đang chờ duyệt để hiển thị.
     */
    public List<SpaceFullResponse> getAllSpaces() {
        String spaceSql = """
                SELECT s.id, f.name as fieldName, s.fieldId, s.code, s.name, s.description, s.url, s.status, s.location, s.masterNodeId, n.name as masterNodeName
                , s.createdAt, s.updatedAt
                FROM spaces s
                JOIN fields f ON s.fieldId = f.id
                JOIN nodes n ON s.masterNodeId = n.id
                """;

        return ConnectionPool.getConnection().withHandle(handle -> {
            // Lấy danh sách spaces
         return   handle.createQuery(spaceSql)
                    .mapToBean(SpaceFullResponse.class)
                    .list();

        });
    }

    public boolean changeStatusSpace(StatusRequest req) {
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
}
