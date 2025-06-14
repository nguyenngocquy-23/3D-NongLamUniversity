package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotMediaCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotModelCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotNavCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.NodeIdRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotMediaResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotModelResponse;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotService;

import java.util.List;

@Path("/v1/admin/hotspot")
public class HotspotController {

    @Inject
    private HotspotService hotspotService;


    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/getHotspotModel")
    public ApiResponse<List<HotspotModelResponse>> getModelByNodeId(NodeIdRequest reqs) {
        List<HotspotModelResponse> result = hotspotService.getModelByNodeId(reqs.getNodeId());

        if (result.size() > 0){
            return ApiResponse.<List<HotspotModelResponse>>builder().statusCode(1000).message("Insert hotspot model successful.").data(result).build();
        } else{
            return ApiResponse.<List<HotspotModelResponse>>builder().statusCode(5000).message("Insert hotspot model failed! Please check.").data(result).build();
        }
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/getHotspotMedia")
    public ApiResponse<List<HotspotMediaResponse>> getMediaByNodeId(NodeIdRequest reqs) {
        List<HotspotMediaResponse> result = hotspotService.getMediaByNodeId(reqs.getNodeId());

        if (result.size() > 0){
            return ApiResponse.<List<HotspotMediaResponse>>builder().statusCode(1000).message("Insert hotspot media successful.").data(result).build();
        } else{
            return ApiResponse.<List<HotspotMediaResponse>>builder().statusCode(5000).message("Insert hotspot media failed! Please check.").data(result).build();
        }
    }
}
