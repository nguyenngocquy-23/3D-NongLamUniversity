package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.entity.EmailVerification;

import java.util.Optional;

@ApplicationScoped
public class EmailVerificationDao {
    public boolean insert(EmailVerification verification) {
        try {
            String sql = "INSERT INTO email_verifications(userId, token, expiredAt) VALUES (:userId, :token, :expiredAt)";
            boolean success = ConnectionPool.getConnection().withHandle(handle -> {
                return handle.createUpdate(sql)
                        .bindBean(verification)
                        .execute() > 0;
            });

            return Boolean.TRUE.equals(success);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public EmailVerification findByUserId(int userId) {
        String sql = "SELECT * FROM email_verifications WHERE userId = :userId";
        Optional<EmailVerification> verification = ConnectionPool.getConnection().withHandle(handle ->
                handle.createQuery(sql)
                        .bind("userId", userId)
                        .mapToBean(EmailVerification.class)
                        .stream()
                        .findFirst());
        return verification.orElse(null);
    }

    public boolean deleteToken(EmailVerification verification) {
        String sql = "DELETE FROM email_verifications WHERE userId = :userId AND token = :token";
        int result = ConnectionPool.getConnection().withHandle(handle ->
                handle.createUpdate(sql)
                        .bindBean(verification)
                        .execute());
        return result > 0;
    }

    public void updateToken(EmailVerification emailVerify) {
        try {
            ConnectionPool.getConnection().inTransaction(handle ->
                    handle.createUpdate("UPDATE email_verifications SET token = :token WHERE id = :id")
                            .bind("token", emailVerify.getToken())
                            .bind("id", emailVerify.getId())
                            .execute());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public EmailVerification findByUserEmail(String email) {
        String sql = "SELECT ev.* FROM email_verifications ev JOIN users u ON ev.userId = u.id WHERE u.email = :email";
        Optional<EmailVerification> verification = ConnectionPool.getConnection().withHandle(handle ->
                handle.createQuery(sql)
                        .bind("email", email)
                        .mapToBean(EmailVerification.class)
                        .stream()
                        .findFirst());
        return verification.orElse(null);
    }
}
