package vn.edu.hcmuaf.virtualnluapi.config;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.utils.EncryptUtil;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Singleton
@Startup
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class StartupConfig {

    @Inject
    private UserDao userDao;

    @PostConstruct
    public void initAdminUser() {
        System.out.println(">>> Bắt đầu initAdminUser()");
        try {
            // Kiểm tra xem có user ADMIN nào chưa
            if (!userDao.existsAdminUser()) {
                System.out.println("Chưa có admin, tạo mới...");
                // Tạo user admin
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(EncryptUtil.hashPassword("admin")); // Hash password
                admin.setEmail("admin@gmail.com");
                admin.setRoleId(SystemConstant.ADMIN_ROLE_ID);
                admin.setStatus((byte) 2);
                admin.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));

                userDao.insert(admin);
                System.out.println("Tạo user admin thành công!");
            } else {
                System.out.println("User admin đã tồn tại, không cần tạo.");
            }

        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
}
