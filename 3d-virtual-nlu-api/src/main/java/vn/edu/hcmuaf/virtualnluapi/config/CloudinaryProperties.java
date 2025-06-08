package vn.edu.hcmuaf.virtualnluapi.config;

import java.io.IOException;
import java.util.Properties;

public class CloudinaryProperties {

    public static Properties properties = new Properties();

    static {
        try {
            properties.load(CloudinaryProperties.class.getClassLoader().getResourceAsStream("Cloudinary.properties"));

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public static final String cloudName = properties.getProperty("cloudinary.cloud.name");
    public static final String apiKey = properties.getProperty("cloudinary.api_key");
    public static final String apiSecret = properties.getProperty("cloudinary.api_secret");
    public static final String uploadPanoFolder = properties.getProperty("cloudinary.folder_upload_pano");

}
