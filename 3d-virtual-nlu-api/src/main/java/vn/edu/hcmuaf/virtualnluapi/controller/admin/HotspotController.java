package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotMediaResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotModelResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotService;

import java.util.List;

@Path("/v1/admin/hotspot")
public class HotspotController {

    @Inject
    private HotspotService hotspotService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/getModel")
    public ApiResponse<HotspotModelResponse> getModelById(HotspotIdRequest reqs) {
        HotspotModelResponse result = hotspotService.getModelById(reqs.getHotspotId());

        if (result != null) {
            return ApiResponse.<HotspotModelResponse>builder().statusCode(1000).message("get hotspot model successful.").data(result).build();
        } else{
            return ApiResponse.<HotspotModelResponse>builder().statusCode(5000).message("get hotspot model failed! Please check.").data(result).build();
        }

    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/getAllModel")
    public ApiResponse<List<HotspotModelResponse>> getAllModel(PageRequest reqs) {
        List<HotspotModelResponse> result = hotspotService.getAllModel(reqs);

        if (result != null) {
            return ApiResponse.<List<HotspotModelResponse>>builder().statusCode(1000).message("get hotspot model successful.").data(result).build();
        } else{
            return ApiResponse.<List<HotspotModelResponse>>builder().statusCode(5000).message("get hotspot model failed! Please check.").data(result).build();
        }
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/getNumTotalModel")
    public ApiResponse<Integer> getNumTotalModel() {
        int result = hotspotService.getNumTotalModel();

        if (result >= 0) {
            return ApiResponse.<Integer>builder().statusCode(1000).message("get num total hotspot model successful.").data(result).build();
        } else{
            return ApiResponse.<Integer>builder().statusCode(5000).message("get num total hotspot model failed! Please check.").data(result).build();
        }
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/countDownloadModel")
    public ApiResponse<Boolean> countDownloadModel(HotspotIdRequest reqs) {
        boolean result = hotspotService.countDownloadModel(reqs);

        if (result) {
            return ApiResponse.<Boolean>builder().statusCode(1000).message("count number download model successful.").data(result).build();
        } else{
            return ApiResponse.<Boolean>builder().statusCode(5000).message("count number download model failed! Please check.").data(result).build();
        }
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/getNumDownloadModel")
    public ApiResponse<Integer> getNumDownloadModel(UserIdRequest reqs) {
        int result = hotspotService.getNumDownloadModel
                (reqs);


        if (result > 0) {
            return ApiResponse.<Integer>builder().statusCode(1000).message("count number download model successful.").data(result).build();
        } else{
            return ApiResponse.<Integer>builder().statusCode(5000).message("count number download model failed! Please check.").data(result).build();
        }
    }

    @POST
    @Path("/searchModel")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApiResponse<List<HotspotModelResponse>> searchModel(SearchRequest request) {
        List<HotspotModelResponse> result = hotspotService.searchModel(request.getSearchKey());
        return ApiResponse.<List<HotspotModelResponse>>builder().statusCode(1000).message("Tim kiem thanh cong").data(result).build();
    }
}
