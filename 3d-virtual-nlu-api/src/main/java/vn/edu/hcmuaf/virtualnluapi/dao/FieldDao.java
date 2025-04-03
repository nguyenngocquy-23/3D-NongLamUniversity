package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class FieldDao {

    public boolean insertField(FieldCreateRequest req){
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int i = handle.createUpdate("INSERT INTO fields (name, createdAt, updatedAt) VALUES (:name, :createdAt, :updatedAt)")
                    .bind("name", req.getName())
                    .bind("createdAt", LocalDateTime.now())
                    .bind("updatedAt", LocalDateTime.now())
                    .execute();
            return i > 0;
        });
    }

    public List<FieldResponse> getAllFields(){
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery("SELECT id, name FROM fields")
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
}
