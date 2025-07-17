package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.ChangeNameRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.IconCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.PageRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class IconDao {


    public List<IconResponse> getAllIcons() {
        String sqlQuery = """
                SELECT id, name, code, url, isActive, createdAt, type, thumbnail
                FROM icons
                ORDER BY createdAt DESC
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sqlQuery)
                    .mapToBean(IconResponse.class)
                    .list();
        });
    }

    public boolean createIcon(IconCreateRequest req) {
        String sqlQuery = """
                INSERT INTO icons(name, code, url, isActive, type, thumbnail, createdAt) 
                VALUES (:name, :code, :url, :isActive, :type, :thumbnail, :createdAt)
                """;
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int rows = handle.createUpdate(sqlQuery)
                    .bind("name", req.getName())
                    .bind("code", req.getCode())
                    .bind("url", req.getIconUrl())
                    .bind("isActive", 1)
                    .bind("createdAt", Timestamp.valueOf(LocalDateTime.now()))
                    .bind("type", req.getType())
                    .bind("thumbnail", req.getThumbnail())
                    .execute();
            return rows == 1;
        });
    }

    public List<IconResponse> search(String searchKey) {
        String sqlQuery = """
                SELECT id, name, code, url, isActive, createdAt, type, thumbnail
                FROM icons
                WHERE name LIKE :searchKey
                ORDER BY createdAt DESC
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sqlQuery)
                    .bind("searchKey", "%" + searchKey + "%")
                    .mapToBean(IconResponse.class)
                    .list();
        });
    }

    public boolean changeStatusIcon(StatusRequest req) {
        String sqlQuery = "UPDATE icons SET isActive = :isActive WHERE id = :id";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int rows = handle.createUpdate(sqlQuery)
                    .bind("isActive", req.getStatus())
                    .bind("id", req.getId())
                    .execute();
            return rows == 1;
        });
    }

    public boolean changeNameIcon(ChangeNameRequest req) {
        String sqlQuery = """
                UPDATE icons SET name = :name, code = :code 
                WHERE id = :id
                """;
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int rows = handle.createUpdate(sqlQuery)
                    .bind("name", req.getName())
                    .bind("code", req.getCode())
                    .bind("id", req.getId())
                    .execute();
            return rows == 1;
        });
    }
}
