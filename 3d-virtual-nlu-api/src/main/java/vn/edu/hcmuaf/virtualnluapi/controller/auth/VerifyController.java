package vn.edu.hcmuaf.virtualnluapi.controller.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.RefreshTokenRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserLoginRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.LoginResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.service.AuthenticationService;
import vn.edu.hcmuaf.virtualnluapi.service.UserService;

import java.text.ParseException;
import java.util.List;

@Path("/authenticate")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class VerifyController {

    @Inject
    AuthenticationService authenticationService;
    @Inject
    UserService userService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<LoginResponse> userInfo(RefreshTokenRequest req) throws ParseException {
        LoginResponse result = authenticationService.refreshToken(req.getToken());
        return ApiResponse.<LoginResponse>builder().statusCode(1000).message("refresh thanh cong").data(result).build();
    }
}
