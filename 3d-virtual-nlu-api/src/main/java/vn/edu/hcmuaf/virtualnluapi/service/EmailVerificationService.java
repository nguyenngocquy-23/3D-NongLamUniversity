package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.hcmuaf.virtualnluapi.dao.EmailVerificationDao;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.entity.EmailVerification;

import java.sql.Timestamp;
import java.util.Random;
import java.util.UUID;

@Slf4j
@ApplicationScoped
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailVerificationService {
    @Inject
    EmailVerificationDao emailVerificationDAO;
    @Inject
    MailService mailService;
    @Inject
    UserDao userDAO;

    private static final int LENGTH_VERIFY_PASSWORD = 6;

    public EmailVerification sendVerify(int userId) {
        String token = UUID.randomUUID().toString();
        Timestamp now = new Timestamp(System.currentTimeMillis());
        Timestamp expried = new Timestamp(now.getTime() + 12 * 60 * 60 * 1000);// 12 hours
        EmailVerification verification = EmailVerification.builder().userId(userId).token(token).expiredAt(expried).build();
        if (!emailVerificationDAO.insert(verification)) return null;
        return verification;
    }

//    public boolean resendEmailVerify(int userId) {
//        EmailVerification emailVerify = emailVerificationDAO.findByUserId(userId);
//        if (emailVerify == null) {
//            throw new RuntimeException("Email verify not found");
//        }
//        User user = userDAO.findById(userId);
//        if (user == null) {
//            throw new RuntimeException("User not found");
//        }
//
//        try {
//            String passTemp = randomPassword(LENGTH_VERIFY_PASSWORD);
//            boolean sended = mailService.sendEmail(user, passTemp);
//            if (sended) {
//                log.info("Email sent successfully");
//                emailVerify.setExpiredAt(Timestamp.from(Instant.now().plus(Duration.ofMinutes(5))));
//                emailVerify.setToken(passTemp);
//                emailVerificationDAO.updateToken(emailVerify);
//            } else {
//                log.warn("Failed to send email");
//                return false;
//            }
//            return true;
//        } catch (MessagingException e) {
//            log.error("Error sending email", e);
//            throw new RuntimeException("Error sending email", e);
//        }
//    }

//    public boolean verifyUser(int userId, String token) {
//        boolean flag = false;
//        EmailVerification verification = emailVerificationDAO.findByUserId(userId);
//        Timestamp now = new Timestamp(System.currentTimeMillis());
//        if (verification != null && now.before(verification.getExpiredAt())) {
//            flag = userDao.activatedUser(userId);
//        }
//        if (flag)
//            emailVerificationDAO.deleteToken(verification);
//        return flag;
//    }

    public String randomPassword(int lenght) {
        String password = "";
//        String charLower = "abcdefghijklmnopqrstuvwxyz";
//        String charUpper = charLower.toUpperCase();
//        String special = "!@#$%^&*()_+";
        String number = "0123456789";
        String allChar = number;
        Random random = new Random();
        for (int i = 0; i < lenght; i++) {
            password += allChar.charAt(random.nextInt(allChar.length()));
        }
        return password;
    }

}
