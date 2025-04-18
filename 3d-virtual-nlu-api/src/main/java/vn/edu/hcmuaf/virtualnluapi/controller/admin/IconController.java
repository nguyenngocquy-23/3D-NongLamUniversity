package vn.edu.hcmuaf.virtualnluapi.controller.admin;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dto.request.IconCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;
import vn.edu.hcmuaf.virtualnluapi.service.IconService;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Path("v1/admin/icon")
public class IconController {

    @Inject
    IconService iconService;


    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertIcon (IconCreateRequest iconReq) {
        IconResponse iconResp = iconService.insertIcon(iconReq);
        if(iconResp != null) {
            ApiResponse<IconResponse> resp = ApiResponse.<IconResponse>builder().
                    statusCode(201)
                    .message("Icon create success ! [insertIcon - IconController]")
                    .data(iconResp).build();

            return Response.status(Response.Status.CREATED).entity(resp).build();
        }
        else {
            ApiResponse<Void> resp = ApiResponse.<Void>builder()
                    .statusCode(400)
                    .message("Icon create failed ! [insertIcon - IconController]")
                    .data(null).build();
        return Response.status(Response.Status.BAD_REQUEST).entity(resp).build();
        }
    }
}
