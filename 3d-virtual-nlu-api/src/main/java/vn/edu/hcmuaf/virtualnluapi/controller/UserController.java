package vn.edu.hcmuaf.virtualnluapi.controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserLoginRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.service.AuthenticationService;
import vn.edu.hcmuaf.virtualnluapi.service.UserService;

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
    public User userInfo(@HeaderParam("Authorization") String token, UserLoginRequest userLoginDTO) {
        boolean authenticated = authenticationService.authenticate(token);
        User user = userService.getUserByUserName(userLoginDTO.getUsername());
        if(!authenticated){
            return null;
        }
        return user;
    }
}
