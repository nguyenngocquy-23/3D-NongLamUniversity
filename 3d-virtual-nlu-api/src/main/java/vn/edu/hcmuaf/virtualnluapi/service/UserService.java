package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.EmailVerificationDao;
import vn.edu.hcmuaf.virtualnluapi.dao.RoleDao;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.entity.EmailVerification;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.utils.EncryptUtil;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class UserService {
    @Inject
    UserDao userDao;
    @Inject
    RoleDao roleDao;
    @Inject
    EmailVerificationService emailVerificationService;
    @Inject
    MailService mailService;

    public boolean isUsernameExists(String username) {
        return userDao.findByUsername(username) != null;
    }

    public boolean isEmailExists(String email) {
        return userDao.getUserByEmail(email) != null;
    }

    public User getUserByUserName(String username) {
        return userDao.findByUsername(username);
    }

    public List<User> getAllUser() {
        return userDao.getAllUser();
    }

    public User findById(int userId) {
        return userDao.findById(userId);
    }

    public boolean forgotPassword(ForgotPasswordRequest request) {
        boolean flag = false;
        User user = userDao.getUserByEmail(request.getEmail());
        if (user != null) {
            String newPassword = emailVerificationService.randomPassword(6);
            try {
                mailService.sendMailResetPassword(user, newPassword);
                user.setPassword(EncryptUtil.hashPassword(newPassword));
                userDao.updatePassword(user.getId(), user.getPassword());
                flag = true;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
        return flag;
    }

    public boolean updateProfile(UpdateProfileRequest request) {
        User oldUser = userDao.findById(request.getUserId());
        if (oldUser == null) {
            return false;
        }
        User user = userDao.findByUsername(request.getUsername());
        if (user != null) {
            return false;
        }
        oldUser.setEmail(request.getEmail());
        oldUser.setUsername(request.getUsername());
        return userDao.updateProfile(oldUser);
    }

    public boolean updatePassword(UpdatePasswordRequest request) {
        User user = userDao.findById(request.getUserId());
        if (user == null) {
            return false;
        }
        if (!EncryptUtil.checkPassword(request.getPassword(), user.getPassword())) {
            return false; // Old password does not match
        }
        user.setPassword(EncryptUtil.hashPassword(request.getNewPassword()));
        return userDao.updatePassword(user.getId(), user.getPassword());
    }

    public boolean updateAvatar(AvatarRequest request) {
        User user = userDao.findById(request.getUserId());
        if (user == null) {
            return false;
        }
        user.setAvatar(request.getAvatar());
        try {
            return userDao.updateAvatar(user);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
