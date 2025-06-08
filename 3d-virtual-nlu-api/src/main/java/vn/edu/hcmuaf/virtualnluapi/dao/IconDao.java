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

    public IconResponse insertIcon (IconCreateRequest iconReq) {
        String sqlQueryInsert = "INSERT INTO icons(name, url) VALUES (:name, :url)";
        String sqlQuerySelect = "SELECT id, name, url, createdAt, isActive as active from icons WHERE id = :id";
        return  ConnectionPool.getConnection().inTransaction( handle -> {
                int generatedId = handle.createUpdate(sqlQueryInsert)
                        .bind("name", iconReq.getName())
                        .bind("url", iconReq.getIconUrl())
                        .executeAndReturnGeneratedKeys("id")
                        .mapTo(int.class)
                        .findOne()
                        .orElseThrow(() -> new RuntimeException("Error inserting icon [IconDao - insertIcon method]"));
                return handle.createQuery(sqlQuerySelect).bind("id", generatedId)
                        .mapToBean(IconResponse.class)
                        .one();
        });
    }


    public List<IconResponse> getAllIcons() {
        String sqlQuery = "SELECT id, name,url, isActive, createdAt, isActive as active FROM icons";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sqlQuery)
                    .mapToBean(IconResponse.class)
                    .list();
        });
    }

    public boolean createIcon(IconCreateRequest req) {
        String sqlQuery = "INSERT INTO icons(name, url, isActive, createdAt) VALUES (:name, :url, :isActive, :createdAt)";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int rows = handle.createUpdate(sqlQuery)
                    .bind("name", req.getName())
                    .bind("url", req.getIconUrl())
                    .bind("isActive", 1)
                    .bind("createdAt", Timestamp.valueOf(LocalDateTime.now()))
                    .execute();
            return rows == 1;
        });
    }
}
