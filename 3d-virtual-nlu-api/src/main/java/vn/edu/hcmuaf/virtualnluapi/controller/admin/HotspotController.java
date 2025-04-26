package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotNavCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotService;

import java.util.List;

@Path("/v1/admin/hotspot")
public class HotspotController {

    @Inject
    private HotspotService hotspotService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/add")
    public ApiResponse<Boolean> insertMultipleHotspot(List<HotspotNavCreateRequest> reqs) {
            boolean result = hotspotService.insertMutipleNavigation(reqs);
            
        if (result){
            return ApiResponse.<Boolean>builder().statusCode(201).message("Create successful.").data(result).build();
        } else{
            return ApiResponse.<Boolean>builder().statusCode(400).message("Create failed! Please check.").data(result).build();
        }


    }


}
