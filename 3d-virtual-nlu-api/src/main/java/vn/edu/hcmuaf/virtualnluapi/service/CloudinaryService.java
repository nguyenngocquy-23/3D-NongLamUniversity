package vn.edu.hcmuaf.virtualnluapi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.config.CloudinaryProperties;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Map;

@ApplicationScoped
public class CloudinaryService {
    private static Cloudinary cloudinary;

    static {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", CloudinaryProperties.cloudName,
                "api_key", CloudinaryProperties.apiKey,
                "api_secret", CloudinaryProperties.apiSecret
        ));
    }

    public String uploadPanorama(InputStream fileInputStream, String fileName, String folder) {
        try {

            byte[] fileBytes = fileInputStream.readAllBytes();

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "public_id", fileName,
                    "folder", folder,
                    "resource_type", "auto"
            );
            Map uploadResult = cloudinary.uploader().upload(fileBytes,uploadParams);
            return  uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage(), e);
        }
    }
}
