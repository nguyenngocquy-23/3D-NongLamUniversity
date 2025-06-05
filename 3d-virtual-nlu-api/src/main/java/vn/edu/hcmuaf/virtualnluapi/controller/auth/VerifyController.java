package vn.edu.hcmuaf.virtualnluapi.controller.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.LoginResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.service.AuthenticationService;
import vn.edu.hcmuaf.virtualnluapi.service.EmailVerificationService;
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
    EmailVerificationService emailVerificationService;

    @POST
    @Path("/refresh")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<LoginResponse> refreshToken(RefreshTokenRequest req) throws ParseException {
        LoginResponse result = authenticationService.refreshToken(req.getToken());
        return ApiResponse.<LoginResponse>builder().statusCode(1000).message("refresh thanh cong").data(result).build();
    }

    @POST
    @Path(("/logout"))
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Void> logout(LogoutRequest request) throws ParseException {
        authenticationService.logout(request.getToken());
        return ApiResponse.<Void>builder().statusCode(1000).message("logout success").build();
    }

    @POST
    @Path(("/verifyEmail"))
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> verifyEmail(VerifyEmailRequest request) throws ParseException {
        boolean result = emailVerificationService.verifyUser(request.getUserId(),request.getToken());
        return ApiResponse.<Boolean>builder()
                .statusCode(result ? 1000 : 5000)
                .message(result ? "Email verified successfully" : "Email verification failed")
                .data(result)
                .build();
    }
}
