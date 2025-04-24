package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults (level = AccessLevel.PRIVATE)
public class CloudinaryUploadResponse {
    String originalFileName; // dùng làm tên ban đầu cho ảnh.
    String url;
}
