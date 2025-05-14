package vn.edu.hcmuaf.virtualnluapi.controller.admin;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import vn.edu.hcmuaf.virtualnluapi.config.CloudinaryProperties;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ApiResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.CloudinaryUploadResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeIdMapResponse;
import vn.edu.hcmuaf.virtualnluapi.service.CloudinaryService;
import vn.edu.hcmuaf.virtualnluapi.service.HotspotService;
import vn.edu.hcmuaf.virtualnluapi.service.NodeService;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("v1/admin/node")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class NodeController {
    @Inject
    NodeService nodeService;

    @Inject
    HotspotService hotspotService;

    @Inject
    CloudinaryService cloudinaryService;

    @POST
    @Path("/insert")
    @Produces(MediaType.APPLICATION_JSON)
    public ApiResponse<Boolean> createNode(List<NodeCreateRequest> reqs) {
        /**
         * Input: Insert danh sách node
         * Output: Trả về resultIdList:
         * [
         * {
         * tempId: id tạm trên NodeCreateRequest.
         * realId: id thực trong DB
         * }
         * ]
         */
        List<NodeIdMapResponse> resultIdList = nodeService.createNode(reqs);
        Map<String, Integer> idMap = resultIdList.stream().collect(Collectors.toMap(NodeIdMapResponse::getTempId, NodeIdMapResponse::getRealId));
        updatesIds(reqs, idMap);
        boolean result = true;
        for (NodeCreateRequest req : reqs) {
            try {
                if (req.getNavHotspots() != null && !req.getNavHotspots().isEmpty()) {
                    hotspotService.insertNavigation(req.getNavHotspots(), req.getId());
                }
                if (req.getInfoHotspots() != null && !req.getInfoHotspots().isEmpty()) {
                    hotspotService.insertNavigation(req.getNavHotspots(),req.getId()  );
                }
                if (req.getMediaHotspots() != null && !req.getMediaHotspots().isEmpty()) {
                    hotspotService.insertMedia(req.getMediaHotspots(), req.getId());
                }
                if (req.getModelHotspots() != null && !req.getModelHotspots().isEmpty()) {
                    hotspotService.insertModel(req.getModelHotspots(), req.getId());
                }
            } catch (Exception e) {
                System.err.println("Lỗi khi insert hotspot cho node: " + req.getId() + ": " + e.getMessage());
                result = false;
            }

        }
            if (result) {
                return ApiResponse.<Boolean>builder().statusCode(1000).message("Tao node thanh cong").data(result).build();
            } else {
                return ApiResponse.<Boolean>builder().statusCode(5000).message("Loi tao node").data(result).build();
            }
        }


        @POST
        @Path("/all")
        @Produces(MediaType.APPLICATION_JSON)
        public ApiResponse<List<NodeFullResponse>> getAllNodes () {
            List<NodeFullResponse> result = nodeService.getAllNodes();

            return ApiResponse.<List<NodeFullResponse>>builder().statusCode(1000).message("Lay danh sach node thanh cong").data(result).build();
        }


        @POST
        @Path("/upload")
        @Consumes(MediaType.MULTIPART_FORM_DATA)
        @Produces(MediaType.APPLICATION_JSON)
        public Response uploadNodes (MultipartFormDataInput input){

            try {
                // Lấy các phần từ multipart với key là "files"
                Map<String, List<InputPart>> uploadForm = input.getFormDataMap();
                List<InputPart> fileParts = uploadForm.get("file");

                if (fileParts == null || fileParts.isEmpty()) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(ApiResponse.<Void>builder()
                                    .statusCode(400)
                                    .message("Không có file nào được gửi lên.")
                                    .data(null)
                                    .build())
                            .build();
                }

                InputPart filePart = fileParts.get(0);
                String fileName = getFileName(filePart.getHeaders());
                InputStream fileInputStream = filePart.getBody(InputStream.class, null);

                String imgURL = cloudinaryService.uploadPanorama(fileInputStream, fileName, CloudinaryProperties.uploadPanoFolder);
                CloudinaryUploadResponse resp = CloudinaryUploadResponse.builder()
                        .originalFileName(fileName)
                        .url(imgURL).build();
                return Response.ok(ApiResponse.<CloudinaryUploadResponse>builder()
                        .statusCode(200)
                        .message("Upload thành công.")
                        .data(resp)
                        .build()).build();

            } catch (Exception e) {
                e.printStackTrace();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(ApiResponse.<Void>builder()
                                .statusCode(500)
                                .message("Lỗi hệ thống: " + e.getMessage())
                                .data(null)
                                .build())
                        .build();
            }
        }


        @POST
        @Path("/uploadMulti")
        @Consumes(MediaType.MULTIPART_FORM_DATA)
        @Produces(MediaType.APPLICATION_JSON)
        public Response uploadMultipeNode (MultipartFormDataInput input){
            try {
                Map<String, List<InputPart>> uploadForm = input.getFormDataMap();
                List<InputPart> fileParts = uploadForm.get("file");

                if (fileParts == null || fileParts.isEmpty()) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(ApiResponse.<Void>builder()
                                    .statusCode(400)
                                    .message("Không thấy dữ liệu ảnh gửi lên")
                                    .data(null)
                                    .build()).build();
                }
                List<CloudinaryUploadResponse> responses = new ArrayList<>();
                for (InputPart filepart : fileParts) {
                    String fileName = getFileName(filepart.getHeaders());
                    String baseName = fileName.contains(".")
                            ? fileName.substring(0, fileName.lastIndexOf('.'))
                            : fileName;
                    InputStream fileInputStream = filepart.getBody(InputStream.class, null);

                    String imgUrl = cloudinaryService.uploadPanorama(fileInputStream, baseName, CloudinaryProperties.uploadPanoFolder);
                    CloudinaryUploadResponse resp = CloudinaryUploadResponse.builder().originalFileName(fileName).url(imgUrl).build();
                    responses.add(resp);
                }

                return Response.ok(ApiResponse.<List<CloudinaryUploadResponse>>builder()
                        .statusCode(200)
                        .message("Upload thành công")
                        .data(responses)
                        .build()).build();
            } catch (Exception e) {
                e.printStackTrace();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(ApiResponse.<Void>builder()
                                .statusCode(500)
                                .message("Hệ thống lỗi: " + e.getMessage())
                                .data(null)
                                .build()).build();
            }
        }

        // Phương thức để lấy tên file từ header
        private String getFileName (MultivaluedMap< String, String > headers){
            String[] contentDisposition = headers.getFirst("Content-Disposition").split(";");
            for (String cd : contentDisposition) {
                if (cd.trim().startsWith("filename")) {
                    return cd.substring(cd.indexOf('=') + 1).trim().replace("\"", "");
                }
            }
            return "unknown";
        }

        /**
         *  Method dùng để thay thế realId trong Dabatabase cho:
         *  1. tempId của node.
         *  2. targetNodeId (temp) của hotspot trong node.
         * idMapResponse:
         *  + String: id temp tạo bằng nanoId đang gán trong biến tempId của mỗi NodeCreateRequest.
         *  + Interger: id thật, sau khi insert nó sẽ trả về id trong database.
         */
        private void updatesIds (List < NodeCreateRequest > reqs, Map < String, Integer > idMapResponse){
            for (NodeCreateRequest req : reqs) {
                if (idMapResponse.containsKey(req.getTempId())) {
                    req.setId(String.valueOf(idMapResponse.get(req.getTempId()))); // Parse giá trị của idMapResponse (realId: int) vè id (string).
                }
                if (req.getNavHotspots() != null) {
                    for (HotspotNavCreateRequest navCreateRequest : req.getNavHotspots()) {
                        String oldTarget = navCreateRequest.getTargetNodeId();
                        if (idMapResponse.containsKey(oldTarget)) {
                            navCreateRequest.setTargetNodeId(String.valueOf(idMapResponse.get(oldTarget)));
                        }
                    }
                }
            }
        }


    }
