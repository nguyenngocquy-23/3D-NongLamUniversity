package vn.edu.hcmuaf.virtualnluapi.utils;

import org.apache.commons.codec.binary.Base64;
import org.mindrot.jbcrypt.BCrypt;

import java.util.UUID;

public class EncryptUtil {

    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(12));
    }

    public static String randomString() {
        return UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);
    }

    public static boolean checkPassword(String plainTextPassword, String hashedPassword) {
        return BCrypt.checkpw(plainTextPassword, hashedPassword);
    }
}
