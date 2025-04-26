package vn.edu.hcmuaf.virtualnluapi.controller.chat;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MessageResponse;
import vn.edu.hcmuaf.virtualnluapi.service.MessageService;

import java.util.List;

@Path("/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChatController {

    private final MessageService messageService = new MessageService();

    @GET
    @Path("/messages")
    public Response getMessages(
            @QueryParam("roomId") int roomId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("limit") @DefaultValue("5") int limit) {

        int offset = page * limit;
        List<MessageResponse> messages = messageService.getMessages(roomId, limit, offset);
        return Response.ok(messages).build();
    }
}
