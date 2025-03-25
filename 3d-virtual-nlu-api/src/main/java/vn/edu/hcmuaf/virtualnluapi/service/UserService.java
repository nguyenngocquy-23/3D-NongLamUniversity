package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.RoleDao;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserRegisterRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.utils.EncryptUtil;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class UserService {
    @Inject
    UserDao userDao;
    @Inject
    RoleDao roleDao;

    public boolean isUsernameExists(String username) {
        return userDao.findByUsername(username) != null;
    }

    public boolean isEmailExists(String email) {
        return userDao.getUserByEmail(email) != null;
    }

    public User getUserByUserName(String username) {
        return userDao.findByUsername(username);
    }

}
