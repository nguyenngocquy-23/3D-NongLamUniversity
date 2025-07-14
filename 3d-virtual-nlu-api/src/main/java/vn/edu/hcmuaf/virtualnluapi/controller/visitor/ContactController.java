package vn.edu.hcmuaf.virtualnluapi.controller.visitor;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.CommentResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;
import vn.edu.hcmuaf.virtualnluapi.service.CommentService;
import vn.edu.hcmuaf.virtualnluapi.service.ContactService;

import java.util.List;

@Path("/contact")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ContactController {
    @Inject
    ContactService contactService;

    @POST
    @Path("/send")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> sendContact(SendContactRequest request) {
        boolean result = contactService.sendContact(request);
        return ApiResponse.<Boolean>builder().statusCode(1000).message("Lien he thanh cong").data(result).build();
    }

    @POST
    @Path("/getAll")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<ContactResponse>> getAllContact() {
        List<ContactResponse> result = contactService.getAllContact();
        return ApiResponse.<List<ContactResponse>>builder().statusCode(1000).message("get danh sach lien he thanh cong").data(result).build();
    }
}
