package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.hcmuaf.virtualnluapi.dao.EmailVerificationDao;
import vn.edu.hcmuaf.virtualnluapi.dao.RoleDao;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserRegisterRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.utils.EncryptUtil;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Slf4j
@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class AuthenticationService {
    @Inject
    UserDao userDao;
    @Inject
    EmailVerificationDao emailVerifyDAO;
    @Inject
    RoleDao roleDao;

    public User signup(UserRegisterRequest userRegisterDTO) {
        // encrypt Password
        String encryptPassword = EncryptUtil.hashPassword(userRegisterDTO.getPassword());
        User user = User.builder()
                .username(userRegisterDTO.getUsername())
                .password(encryptPassword)
                .status((byte) 1)
                .email(userRegisterDTO.getEmail())
                .roleId(roleDao.getRoleByName("USER").getId())
                .createdAt(Timestamp.valueOf(LocalDateTime.now()))
                .build();
        //signup user
        if (!userDao.insert(user)) {
            return null;
        }
        return userDao.findByUsername(user.getUsername());
    }
}