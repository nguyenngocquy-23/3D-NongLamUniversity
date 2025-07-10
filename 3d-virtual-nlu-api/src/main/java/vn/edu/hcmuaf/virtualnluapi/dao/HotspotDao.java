package vn.edu.hcmuaf.virtualnluapi.dao;


import jakarta.enterprise.context.ApplicationScoped;
import org.jdbi.v3.core.statement.PreparedBatch;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@ApplicationScoped
public class HotspotDao {
    public boolean insertHotspotNavigation(List<HotspotNavCreateRequest> req, String nodeId) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, status, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity) " + "VALUES(:nodeId, :type, :iconId, :status, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity)";
        String sqlInsertNavigation = "INSERT INTO hotspot_navigations(hotspotId, targetNodeId) " + "VALUES(:hotspotId, :targetNodeId)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotNavCreateRequest navReq : req) {
                hotspotBatch.bind("nodeId", Integer.valueOf(nodeId)).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("status", 1).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).add();
            }

            List<Integer> generateIds = hotspotBatch.executePreparedBatch().mapTo(Integer.class).list();
            if (generateIds.size() != req.size()) {
                throw new IllegalStateException("[HotspotDao - insertMultipeNav] : Mismatch between hotspot and id return.");
            }

            PreparedBatch navigationBatch = handle.prepareBatch(sqlInsertNavigation);
            for (int i = 0; i < generateIds.size(); i++) {
                navigationBatch.bind("hotspotId", generateIds.get(i)).bind("targetNodeId", Integer.valueOf(req.get(i).getTargetNodeId())).add();
            }
            navigationBatch.execute();
            return true;
        });
    }

    public boolean insertHotspotInformation(List<HotspotInfoCreateRequest> req, String nodeId) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, status, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity) " + "VALUES(:nodeId, :type, :iconId, :status, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity)";
        String sqlInsertNavigation = "INSERT INTO hotspot_informations(hotspotId, title, content) " + "VALUES(:hotspotId, :title, :content)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotInfoCreateRequest navReq : req) {
                hotspotBatch.bind("nodeId", Integer.valueOf(nodeId)).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("status", 1).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).add();
            }

            List<Integer> generateIds = hotspotBatch.executePreparedBatch().mapTo(Integer.class).list();
            if (generateIds.size() != req.size()) {
                throw new IllegalStateException("[HotspotDao - insertMultipeNav] : Mismatch between hotspot and id return.");
            }

            PreparedBatch navigationBatch = handle.prepareBatch(sqlInsertNavigation);
            for (int i = 0; i < generateIds.size(); i++) {
                navigationBatch.bind("hotspotId", generateIds.get(i)).bind("title", req.get(i).getTitle()).bind("content", req.get(i).getContent()).add();
            }
            navigationBatch.execute();
            return true;
        });
    }

    /**
     * thêm danh sách hotspot model.
     */
    public boolean insertHotspotModel(List<HotspotModelCreateRequest> req, String nodeId) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, status, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity, createdAt, updatedAt) " + "VALUES(:nodeId, :type, :iconId, :status, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity, :createdAt, :updatedAt)";
        String sqlInsertNavigation = "INSERT INTO hotspot_models(hotspotId, modelUrl, thumbnailUrl, name, description, numDownload) " + "VALUES(:hotspotId, :modelUrl, :name, :description, 0)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotModelCreateRequest navReq : req) {
                hotspotBatch.bind("nodeId", Integer.valueOf(nodeId)).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("status", 1).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).bind("createdAt", Timestamp.valueOf(LocalDateTime.now())).bind("updatedAt", Timestamp.valueOf(LocalDateTime.now())).add();
            }

            List<Integer> generateIds = hotspotBatch.executePreparedBatch().mapTo(Integer.class).list();
            if (generateIds.size() != req.size()) {
                throw new IllegalStateException("[HotspotDao - insertMultipeModel] : Mismatch between hotspot and id return.");
            }

            PreparedBatch navigationBatch = handle.prepareBatch(sqlInsertNavigation);
            for (int i = 0; i < generateIds.size(); i++) {
                navigationBatch.bind("hotspotId", generateIds.get(i)).bind("modelUrl", req.get(i).getModelUrl()).bind("thumbnailUrl", req.get(i).getThumbnailUrl()).bind("name", req.get(i).getName()).bind("description", req.get(i).getDescription()).add();
            }
            navigationBatch.execute();
            return true;
        });
    }

    public boolean insertHotspotMedia(List<HotspotMediaCreateRequest> reqs, String nodeId) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, status, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity, createdAt, updatedAt) " + "VALUES(:nodeId, :type, :iconId, :status, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity, :createdAt, :updatedAt)";
        String sqlInsertNavigation = "INSERT INTO hotspot_medias(hotspotId, mediaType, mediaUrl, caption, cornerPointList) " + "VALUES(:hotspotId, :mediaType, :mediaUrl, :caption, :cornerPointList)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotMediaCreateRequest navReq : reqs) {
                hotspotBatch.bind("nodeId", Integer.valueOf(nodeId)).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("status", 1).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).bind("createdAt", Timestamp.valueOf(LocalDateTime.now())).bind("updatedAt", Timestamp.valueOf(LocalDateTime.now())).add();
            }

            List<Integer> generateIds = hotspotBatch.executePreparedBatch().mapTo(Integer.class).list();
            if (generateIds.size() != reqs.size()) {
                throw new IllegalStateException("[HotspotDao - insertMultipeMedia] : Mismatch between hotspot and id return.");
            }

            PreparedBatch navigationBatch = handle.prepareBatch(sqlInsertNavigation);
            for (int i = 0; i < generateIds.size(); i++) {
                navigationBatch.bind("hotspotId", generateIds.get(i)).bind("mediaType", reqs.get(i).getMediaType()).bind("mediaUrl", reqs.get(i).getMediaUrl()).bind("caption", reqs.get(i).getCaption()).bind("cornerPointList", reqs.get(i).getCornerPointList()).add();
            }
            navigationBatch.execute();
            return true;
        });
    }


    public List<HotspotMediaResponse> getMediaByNodeId(int nodeId) {
        String sql = "SELECT h.id, h.nodeId,h.type, h.iconId, h.status, h.positionX, h.positionY, h.positionZ, " + "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" + ", m.mediaType, m.mediaUrl, m.caption, m.cornerPointList " + "FROM hotspots AS h JOIN hotspot_medias " + "AS m ON h.id = m.hotspotId WHERE h.nodeId = :nodeId and h.status = 1";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotMediaResponse.class).list();
        });
    }

    public List<HotspotNavigationResponse> getNavigationByNodeId(int nodeId) {
        String sql = "SELECT h.id, h.nodeId, h.type, h.iconId, h.status, h.positionX, h.positionY, h.positionZ, " + "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" + ", n.targetNodeId " + "FROM hotspots AS h JOIN hotspot_navigations AS n ON h.id = n.hotspotId WHERE h.nodeId = :nodeId and h.status = 1";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotNavigationResponse.class).list();
        });
    }

    public List<HotspotInformationResponse> getInformationByNodeId(int nodeId) {
        String sql = "SELECT h.id, h.nodeId, h.type, h.iconId, h.status, h.positionX, h.positionY, h.positionZ, " + "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" + ", i.title, i.content " + "FROM hotspots AS h JOIN hotspot_informations AS i ON h.id = i.hotspotId WHERE h.nodeId = :nodeId and h.status = 1";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotInformationResponse.class).list();
        });
    }


    public List<HotspotModelResponse> getModelByNodeId(int nodeId) {
        String sql = "SELECT h.id, h.nodeId, h.type, h.iconId, h.status, h.positionX, h.positionY, h.positionZ, " + "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity, m.modelUrl, m.thumbnailUrl, m.name, m.description, m.numDownload " + "FROM hotspots AS h JOIN hotspot_models " + "AS m ON h.id = m.hotspotId WHERE h.nodeId = :nodeId and h.status = 1";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotModelResponse.class).list();
        });
    }

    public int updateNavHotspots(List<HotspotNavUpdateRequest> navHotspots, int nodeId) {
        String sqlUpdateHotspot = "UPDATE hotspots SET " + "type = :type, iconId = :iconId, status = :status, positionX = :posX, positionY = :posY, positionZ = :posZ, " + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, " + "color = :color, backgroundColor = :backgroundColor, " + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity " + "WHERE id = :id";

        String sqlUpdateNavigation = "UPDATE hotspot_navigations SET targetNodeId = :targetNodeId WHERE hotspotId = :hotspotId";
        List<HotspotNavCreateRequest> navCreateRequests = new ArrayList<>();
        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateNavBatch = handle.prepareBatch(sqlUpdateNavigation);

            for (HotspotNavUpdateRequest navReq : navHotspots) {
                try {
                    Integer.parseInt(navReq.getId());
                    updateBaseBatch.bind("id", navReq.getId()).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("status", navReq.getStatus()).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).add();

                    updateNavBatch.bind("hotspotId", navReq.getId()).bind("targetNodeId", Integer.valueOf(navReq.getTargetNodeId())).add();
                } catch (Exception e) {
                    navCreateRequests.add(HotspotNavCreateRequest.builder().nodeId(navReq.getNodeId()).type(navReq.getType()).iconId(navReq.getIconId()).positionX(navReq.getPositionX()).positionY(navReq.getPositionY()).positionZ(navReq.getPositionZ()).pitchX(navReq.getPitchX()).yawY(navReq.getYawY()).rollZ(navReq.getRollZ()).scale(navReq.getScale()).color(navReq.getColor()).backgroundColor(navReq.getBackgroundColor()).allowBackgroundColor(navReq.getAllowBackgroundColor()).opacity(navReq.getOpacity()).targetNodeId(navReq.getTargetNodeId()).build());
                }
            }
            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateNavBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            if (!navCreateRequests.isEmpty()) {
                insertHotspotNavigation(navCreateRequests, String.valueOf(nodeId));
            }

            return totalUpdated + totalInserted;
        });

    }

    public int updateInfoHotspots(List<HotspotInfoUpdateRequest> infoHotspots, int nodeId) {
        String sqlUpdateHotspot = "UPDATE hotspots SET " + "type = :type, iconId = :iconId, status = :status, positionX = :posX, positionY = :posY, positionZ = :posZ, " + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, " + "color = :color, backgroundColor = :backgroundColor, " + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity " + "WHERE id = :id";

        String sqlUpdateInfo = "UPDATE hotspot_informations SET title = :title, content = :content WHERE hotspotId = :hotspotId";
        List<HotspotInfoCreateRequest> infoCreateRequests = new ArrayList<>();
        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateInfoBatch = handle.prepareBatch(sqlUpdateInfo);

            for (HotspotInfoUpdateRequest infoReq : infoHotspots) {
                try {
                    Integer.parseInt(infoReq.getId());
                    updateBaseBatch.bind("id", infoReq.getId()).bind("type", infoReq.getType()).bind("iconId", infoReq.getIconId()).bind("status", infoReq.getStatus()).bind("posX", infoReq.getPositionX()).bind("posY", infoReq.getPositionY()).bind("posZ", infoReq.getPositionZ()).bind("pitchX", infoReq.getPitchX()).bind("yawY", infoReq.getYawY()).bind("rollZ", infoReq.getRollZ()).bind("scale", infoReq.getScale()).bind("color", infoReq.getColor()).bind("backgroundColor", infoReq.getBackgroundColor()).bind("allowBackgroundColor", infoReq.getAllowBackgroundColor()).bind("opacity", infoReq.getOpacity()).add();

                    updateInfoBatch.bind("hotspotId", infoReq.getId()).bind("title", infoReq.getTitle()).bind("content", infoReq.getContent()).add();
                } catch (NumberFormatException e) {
                    infoCreateRequests.add(HotspotInfoCreateRequest.builder().nodeId(infoReq.getNodeId()).type(infoReq.getType()).iconId(infoReq.getIconId()).positionX(infoReq.getPositionX()).positionY(infoReq.getPositionY()).positionZ(infoReq.getPositionZ()).pitchX(infoReq.getPitchX()).yawY(infoReq.getYawY()).rollZ(infoReq.getRollZ()).scale(infoReq.getScale()).color(infoReq.getColor()).backgroundColor(infoReq.getBackgroundColor()).allowBackgroundColor(infoReq.getAllowBackgroundColor()).opacity(infoReq.getOpacity()).title(infoReq.getTitle()).content(infoReq.getContent()).build());
                }
            }

            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateInfoBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            if (!infoCreateRequests.isEmpty()) {
                insertHotspotInformation(infoCreateRequests, String.valueOf(nodeId));
            }

            return totalUpdated + totalInserted;
        });
    }

    public int updateMediaHotspots(List<HotspotMediaUpdateRequest> mediaHotspots, int nodeId) {
        String sqlUpdateHotspot = "UPDATE hotspots SET " + "type = :type, iconId = :iconId, status = :status, positionX = :posX, positionY = :posY, positionZ = :posZ, " + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, " + "color = :color, backgroundColor = :backgroundColor, " + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity " + "WHERE id = :id";

        String sqlUpdateMedia = "UPDATE hotspot_medias SET mediaType = :mediaType, mediaUrl = :mediaUrl, caption = :caption, cornerPointList = :cornerPointList WHERE hotspotId = :hotspotId";
        List<HotspotMediaCreateRequest> mediaCreateRequests = new ArrayList<>();
        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateMediaBatch = handle.prepareBatch(sqlUpdateMedia);

            for (HotspotMediaUpdateRequest mediaReq : mediaHotspots) {
                try {
                    Integer.parseInt(mediaReq.getId());
                    updateBaseBatch.bind("id", mediaReq.getId()).bind("type", mediaReq.getType()).bind("iconId", mediaReq.getIconId()).bind("status", mediaReq.getStatus()).bind("posX", mediaReq.getPositionX()).bind("posY", mediaReq.getPositionY()).bind("posZ", mediaReq.getPositionZ()).bind("pitchX", mediaReq.getPitchX()).bind("yawY", mediaReq.getYawY()).bind("rollZ", mediaReq.getRollZ()).bind("scale", mediaReq.getScale()).bind("color", mediaReq.getColor()).bind("backgroundColor", mediaReq.getBackgroundColor()).bind("allowBackgroundColor", mediaReq.getAllowBackgroundColor()).bind("opacity", mediaReq.getOpacity()).add();

                    updateMediaBatch.bind("hotspotId", mediaReq.getId()).bind("mediaType", mediaReq.getMediaType()).bind("mediaUrl", mediaReq.getMediaUrl()).bind("caption", mediaReq.getCaption()).bind("cornerPointList", mediaReq.getCornerPointList()).add();
                } catch (Exception e) {
                    mediaCreateRequests.add(HotspotMediaCreateRequest.builder().nodeId(mediaReq.getNodeId()).type(mediaReq.getType()).iconId(mediaReq.getIconId()).positionX(mediaReq.getPositionX()).positionY(mediaReq.getPositionY()).positionZ(mediaReq.getPositionZ()).pitchX(mediaReq.getPitchX()).yawY(mediaReq.getYawY()).rollZ(mediaReq.getRollZ()).scale(mediaReq.getScale()).color(mediaReq.getColor()).backgroundColor(mediaReq.getBackgroundColor()).allowBackgroundColor(mediaReq.getAllowBackgroundColor()).opacity(mediaReq.getOpacity()).mediaType(mediaReq.getMediaType()).mediaUrl(mediaReq.getMediaUrl()).caption(mediaReq.getCaption()).cornerPointList(mediaReq.getCornerPointList()).build());
                }
            }

            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateMediaBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            if (!mediaCreateRequests.isEmpty()) {
                insertHotspotMedia(mediaCreateRequests, String.valueOf(nodeId));
            }

            return totalUpdated + totalInserted;
        });
    }

    public int updateModelHotspots(List<HotspotModelUpdateRequest> modelHotspots, int nodeId) {
        String sqlUpdateHotspot = "UPDATE hotspots SET " + "type = :type, iconId = :iconId, status = :status, positionX = :posX, positionY = :posY, positionZ = :posZ, " + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, " + "color = :color, backgroundColor = :backgroundColor, " + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity " + "WHERE id = :id";
        String sqlUpdateModel = "UPDATE hotspot_models SET modelUrl = :modelUrl, thumbnailUrl := thumbnailUrl, name = :name, description = :description WHERE hotspotId = :hotspotId";
        List<HotspotModelCreateRequest> modelCreateRequests = new ArrayList<>();
        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateModelBatch = handle.prepareBatch(sqlUpdateModel);

            for (HotspotModelUpdateRequest modelReq : modelHotspots) {
                try {

                    Integer.parseInt(modelReq.getId());
                    updateBaseBatch.bind("id", modelReq.getId()).bind("type", modelReq.getType()).bind("iconId", modelReq.getIconId()).bind("status", modelReq.getStatus()).bind("posX", modelReq.getPositionX()).bind("posY", modelReq.getPositionY()).bind("posZ", modelReq.getPositionZ()).bind("pitchX", modelReq.getPitchX()).bind("yawY", modelReq.getYawY()).bind("rollZ", modelReq.getRollZ()).bind("scale", modelReq.getScale()).bind("color", modelReq.getColor()).bind("backgroundColor", modelReq.getBackgroundColor()).bind("allowBackgroundColor", modelReq.getAllowBackgroundColor()).bind("opacity", modelReq.getOpacity()).add();

                    updateModelBatch.bind("hotspotId", modelReq.getId()).bind("modelUrl", modelReq.getModelUrl()).bind("thumbnailUrl", modelReq.getThumbnailUrl()).bind("name", modelReq.getName()).bind("description", modelReq.getDescription()).add();

                } catch (Exception e) {
                    modelCreateRequests.add(HotspotModelCreateRequest.builder().nodeId(modelReq.getNodeId()).type(modelReq.getType()).iconId(modelReq.getIconId()).positionX(modelReq.getPositionX()).positionY(modelReq.getPositionY()).positionZ(modelReq.getPositionZ()).pitchX(modelReq.getPitchX()).yawY(modelReq.getYawY()).rollZ(modelReq.getRollZ()).scale(modelReq.getScale()).color(modelReq.getColor()).backgroundColor(modelReq.getBackgroundColor()).allowBackgroundColor(modelReq.getAllowBackgroundColor()).opacity(modelReq.getOpacity()).modelUrl(modelReq.getModelUrl()).thumbnailUrl(modelReq.getThumbnailUrl()).name(modelReq.getName()).description(modelReq.getDescription()).build());
                }
            }
            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateModelBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            if (!modelCreateRequests.isEmpty()) {
                insertHotspotModel(modelCreateRequests, String.valueOf(nodeId));
            }

            return totalUpdated + totalInserted;
        });
    }

    public HotspotModelResponse getModelById(int hotspotId) {
        String sql = """
                SELECT h.id, h.nodeId, h.type, h.iconId, h.status, h.positionX, h.positionY, h.positionZ,
                h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity,
                m.modelUrl, m.thumbnailUrl, m.name, m.description, u.username as usernameAuthor, m.numDownload, h.updatedAt
                FROM hotspots AS h
                JOIN hotspot_models AS m ON h.id = m.hotspotId
                JOIN nodes as n ON n.id = h.nodeId
                JOIN users as u ON n.userId = u.id
                WHERE h.id = :hotspotId
                """;
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("hotspotId", hotspotId).mapToBean(HotspotModelResponse.class).findOne().orElse(null);
        });
    }

    public List<HotspotModelResponse> getAllModel(PageRequest reqs) {
        String sql = """
                SELECT h.id, h.nodeId, h.type, h.iconId, h.status, h.positionX, h.positionY, h.positionZ,
                h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity,
                m.modelUrl, m.thumbnailUrl, m.name, m.description, u.username as usernameAuthor, m.numDownload, h.updatedAt
                FROM hotspots AS h
                JOIN hotspot_models AS m ON h.id = m.hotspotId
                JOIN nodes as n ON n.id = h.nodeId
                JOIN users as u ON n.userId = u.id
                WHERE h.status = 1
                ORDER BY n.updatedAt DESC
                LIMIT :limit OFFSET :offset
                """;

        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .bind("limit", reqs.getLimit())
                    .bind("offset", reqs.getPage() * reqs.getLimit())
                    .mapToBean(HotspotModelResponse.class).list();
        });
    }

    public boolean countDownloadModel(HotspotIdRequest reqs) {
        String sql = "UPDATE hotspot_models SET numDownload = numDownload + 1 WHERE hotspotId = :hotspotId";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            int updatedRows = handle.createUpdate(sql).bind("hotspotId", reqs.getHotspotId()).execute();
            return updatedRows > 0;
        });
    }

    public List<HotspotModelResponse> searchModel(String searchKey) {
        String sql = """
                SELECT h.id, h.nodeId, h.type, h.iconId, h.status, h.positionX, h.positionY, h.positionZ,
                h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity,
                m.modelUrl, m.thumbnailUrl, m.name, m.description, u.username as usernameAuthor, m.numDownload, h.updatedAt
                FROM hotspots AS h
                JOIN hotspot_models AS m ON h.id = m.hotspotId
                JOIN nodes as n ON n.id = h.nodeId
                JOIN users as u ON n.userId = u.id
                WHERE n.status = 1 AND m.name LIKE :searchKey
                ORDER BY n.updatedAt DESC
                LIMIT 10 OFFSET 0
                """;

        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql)
                    .bind("searchKey", "%" + searchKey + "%")
                    .mapToBean(HotspotModelResponse.class).list();
        });
    }

    public int getNumTotalModel() {
        String sql = "SELECT COUNT(*) FROM hotspots AS h JOIN hotspot_models AS m ON h.id = m.hotspotId WHERE h.status = 1";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).mapTo(Integer.class).findOne().orElse(0);
        });
    }
}
