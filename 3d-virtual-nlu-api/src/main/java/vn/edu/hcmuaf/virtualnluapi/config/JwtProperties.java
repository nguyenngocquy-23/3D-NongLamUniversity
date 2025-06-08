package vn.edu.hcmuaf.virtualnluapi.config;

import java.io.IOException;
import java.util.Properties;

public class JwtProperties {
    private static Properties properties = new Properties();

    static {
        try {
            properties.load(JwtProperties.class.getClassLoader().getResourceAsStream("JWT.properties"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public static final String signerKey = properties.getProperty("jwt.signerKey");
    public static final int enableDuration = Integer.parseInt(properties.getProperty("jwt.enable-duration"));
    public static final int refreshDuration = Integer.parseInt(properties.getProperty("jwt.refresh-duration"));

}
