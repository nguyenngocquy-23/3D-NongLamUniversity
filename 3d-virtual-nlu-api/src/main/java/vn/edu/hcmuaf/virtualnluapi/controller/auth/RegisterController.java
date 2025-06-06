package vn.edu.hcmuaf.virtualnluapi.controller.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserRegisterRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.EmailVerification;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.service.AuthenticationService;
import vn.edu.hcmuaf.virtualnluapi.service.EmailVerificationService;
import vn.edu.hcmuaf.virtualnluapi.service.MailService;
import vn.edu.hcmuaf.virtualnluapi.service.UserService;
import vn.edu.hcmuaf.virtualnluapi.utils.Validator;

@Path("/register")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor(onConstructor_ = @Inject)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class RegisterController {
    @Inject
    AuthenticationService authenticationService;
    @Inject
    UserService userService;
    @Inject
    EmailVerificationService verificationService;
    @Inject
    MailService mail;

    @POST
    public Response registerUser(UserRegisterRequest userForm) {
        if (userForm == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid user data")
                    .build();
        }

        // Validate user input
        boolean hasError = validate(userForm);
        if (hasError) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Validation failed: Username or Email already exists, or password is invalid.")
                    .build();
        }

        // Register user
        User user = authenticationService.signup(userForm);
        if (user == null) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("User registration failed")
                    .build();
        }

        // Create email verification
        EmailVerification verification = verificationService.sendVerify(user.getId());
        if (verification != null) {
            try {
                mail.sendMailVerifyUser(user, verification);
            } catch (Exception e) {
                throw new RuntimeException(e.getMessage());
            }
            return Response.ok("Registration successful. Please check your email to verify your account.").entity(user.getId())
                    .build();
        }

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Email verification failed")
                .build();
//        return ApiResponse.builder()
//                .statusCode(200)
//                .message("Email verification failed")
//                .build();
    }

    private boolean validate(UserRegisterRequest user) {
        if (Validator.containsWhitespace(user.getUsername()) || userService.isUsernameExists(user.getUsername())) {
            return true;
        }
        if (!Validator.isValidEmail(user.getEmail()) || userService.isEmailExists(user.getEmail())) {
            return true;
        }
        if (Validator.isEmpty(user.getUsername()) || Validator.containsWhitespace(user.getPassword())
                || !Validator.isValidMinLength(user.getPassword(), 6)) {
            return true;
        }
        if (!Validator.isValidPassword(user.getPassword())) {
            return true;
        }
        return false;
    }
}
