package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.PageRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class FieldDao {

    public boolean insertField(FieldCreateRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("INSERT INTO fields (name, code, status, createdAt, updatedAt) VALUES (:name, :code, :status, :createdAt, :updatedAt)")
                    .bind("name", req.getName())
                    .bind("code", req.getCode())
                    .bind("status", 1)
                    .bind("createdAt", LocalDateTime.now())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public List<FieldResponse> getAllFields(PageRequest request) {
        String sql = """
                SELECT id, code, name, status, createdAt, updatedAt 
                FROM fields
                LIMIT :limit OFFSET :offset
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .bind("limit", request.getLimit())
                    .bind("offset", request.getPage() * request.getLimit())
                    .mapToBean(FieldResponse.class)
                    .list();
        });
    }

    public FieldResponse getFieldById(int id) {
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery("SELECT id, name FROM  fields WHERE id = :id")
                    .bind("id", id)
                    .mapToBean(FieldResponse.class)
                    .one();
        });
    }

    public boolean changeStatusField(StatusRequest req) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("UPDATE fields SET status = :status, updatedAt = :updatedAt WHERE id = :id")
                    .bind("status", req.getStatus())
                    .bind("id", req.getId())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public boolean changeNameField(FieldCreateRequest req) {
        String updateSql = "UPDATE fields SET name = :name, code = :code, updatedAt = :updatedAt WHERE id = :id";
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

    public int countAllFields() {
        String countSql = "SELECT COUNT(*) FROM fields";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(countSql)
                    .mapTo(Integer.class)
                    .one();
        });
    }

    public List<FieldResponse> search(String searchKey) {
        String searchSql = """
                SELECT id, code, name, status, createdAt, updatedAt 
                FROM fields
                WHERE name LIKE :searchKey OR code LIKE :searchKey
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(searchSql)
                    .bind("searchKey", "%" + searchKey + "%")
                    .mapToBean(FieldResponse.class)
                    .list();
        });
    }
}
