package vn.edu.hcmuaf.virtualnluapi.controller.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserLoginRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.LoginResponse;
import vn.edu.hcmuaf.virtualnluapi.service.AuthenticationService;

@Path("/login")
public class LoginController {
    @Inject
    AuthenticationService authenticationService;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<LoginResponse> login(UserLoginRequest userLoginDTO) {
        LoginResponse loginResponse = authenticationService.login(userLoginDTO);
        if (loginResponse == null) {
            return ApiResponse.<LoginResponse>builder().statusCode(5000).message("login fail").build();
        }
        return ApiResponse.<LoginResponse>builder().statusCode(1000).message("login success").data(loginResponse).build();
    }
}
