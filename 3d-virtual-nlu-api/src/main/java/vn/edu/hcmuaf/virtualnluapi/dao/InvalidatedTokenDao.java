package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.entity.InvalidatedToken;

@ApplicationScoped
public class InvalidatedTokenDao {

    public void saveInvalidToken(InvalidatedToken token) {
        ConnectionPool.getConnection().inTransaction(handle -> {
            return handle.createUpdate("INSERT INTO invalidated_tokens (id, expiredAt) VALUES (:id, :expiredAt)")
                    .bind("id", token.getId())
                    .bind("expiredAt", token.getExpiredAt())
                    .execute();
        });
    }

    public boolean existsById(String token) {
        return ConnectionPool.getConnection().inTransaction(handle -> {
            return handle.createQuery("SELECT COUNT(*) FROM invalidated_tokens WHERE id = :id")
                    .bind("id", token)
                    .mapTo(Integer.class)
                    .one() > 0;
        });
    }
}
