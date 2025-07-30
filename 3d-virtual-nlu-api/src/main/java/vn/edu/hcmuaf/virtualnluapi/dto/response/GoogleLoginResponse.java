package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hcmuaf.virtualnluapi.entity.User;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GoogleLoginResponse {
    String token;
    boolean authenticated;
    User user;
}
