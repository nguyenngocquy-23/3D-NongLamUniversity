package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.IconCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class IconDao {



    public List<IconResponse> getAllIcons() {
        String sqlQuery = "SELECT id, name,url, isActive, createdAt, isActive as active, type, thumbnail  FROM icons";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sqlQuery)
                    .mapToBean(IconResponse.class)
                    .list();
        });
    }

    public boolean createIcon(IconCreateRequest req) {
        String sqlQuery = "INSERT INTO icons(name, url, isActive, type, thumbnail  createdAt) VALUES (:name, :url, :isActive, :createdAt, :type, :thumbnail)";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int rows = handle.createUpdate(sqlQuery)
                    .bind("name", req.getName())
                    .bind("url", req.getIconUrl())
                    .bind("isActive", 1)
                    .bind("createdAt", Timestamp.valueOf(LocalDateTime.now()))
                    .bind("type", req.getType())
                    .bind("type", req.getThumbnail())
                    .execute();
            return rows == 1;
        });
    }
}
