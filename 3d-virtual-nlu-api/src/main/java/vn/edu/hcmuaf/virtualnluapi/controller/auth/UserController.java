package vn.edu.hcmuaf.virtualnluapi.controller.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.service.AuthenticationService;
import vn.edu.hcmuaf.virtualnluapi.service.UserService;

import java.util.List;

@Path("/user")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class UserController {

    @Inject
    AuthenticationService authenticationService;
    @Inject
    UserService userService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public User userInfo(@HeaderParam("Authorization") String token, UserLoginRequest request) {
        // check token có trong table invlaidToken không
        boolean authenticated = authenticationService.authenticate(token);
        if (!authenticated) {
            return null;
        }
        User user = userService.getUserByUserName(request.getUsername());
        return user;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<User>> getAllUsers(@HeaderParam("Authorization") String token) {
        boolean authenticated = authenticationService.authenticate(token);
        List<User> users = userService.getAllUser();
        if (!authenticated) {
            return ApiResponse.<List<User>>builder().statusCode(5000).message("loi xac thuc").data(null).build();
        }
        return ApiResponse.<List<User>>builder().statusCode(1000).message("lay danh sach thanh cong").data(users).build();
    }

    @POST
    @Path(("/forgotPassword"))
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> forgotPassword(ForgotPasswordRequest request) {
        boolean result = userService.forgotPassword(request);
        return ApiResponse.<Boolean>builder()
                .statusCode(result ? 1000 : 5000)
                .message(result ? "Password reset email sent successfully" : "Failed to send password reset email")
                .data(result)
                .build();
    }

    @POST
    @Path(("/updateProfile"))
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> updateProfile(UpdateProfileRequest request) {
        boolean result = userService.updateProfile(request);
        return ApiResponse.<Boolean>builder()
                .statusCode(result ? 1000 : 5000)
                .message(result ? "Update profile successfully" : "Update profile failed")
                .data(result)
                .build();
    }

    @POST
    @Path(("/updatePassword"))
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> updatePassword(UpdatePasswordRequest request) {
        boolean result = userService.updatePassword(request);
        return ApiResponse.<Boolean>builder()
                .statusCode(result ? 1000 : 5000)
                .message(result ? "Update password successfully" : "Update password failed")
                .data(result)
                .build();
    }

    @POST
    @Path(("/updateAvatar"))
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> updateAvatar(AvatarRequest request) {
        boolean result = userService.updateAvatar(request);
        return ApiResponse.<Boolean>builder()
                .statusCode(result ? 1000 : 5000)
                .message(result ? "Update avatar successfully" : "Update avatar failed")
                .data(result)
                .build();
    }
}
