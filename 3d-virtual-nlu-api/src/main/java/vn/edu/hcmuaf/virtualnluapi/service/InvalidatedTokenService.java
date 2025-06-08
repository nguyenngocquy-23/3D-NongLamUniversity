package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.InvalidatedTokenDao;
import vn.edu.hcmuaf.virtualnluapi.entity.InvalidatedToken;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class InvalidatedTokenService {
    @Inject
    InvalidatedTokenDao invalidatedTokenDAO;

    public void save(InvalidatedToken invalidatedToken) {
        invalidatedTokenDAO.saveInvalidToken(invalidatedToken);
    }

    public boolean existsById(String token) {
        return invalidatedTokenDAO.existsById(token);
    }

    public boolean removeAll() {
        return invalidatedTokenDAO.removeAll();
    }
}
