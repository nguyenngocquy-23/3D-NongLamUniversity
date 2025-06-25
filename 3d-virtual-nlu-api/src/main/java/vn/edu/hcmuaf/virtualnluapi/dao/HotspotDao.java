package vn.edu.hcmuaf.virtualnluapi.dao;


import jakarta.enterprise.context.ApplicationScoped;
import org.jdbi.v3.core.statement.PreparedBatch;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@ApplicationScoped
public class HotspotDao {

    /**
     * Thêm 1 hotspot vào DB. ---------THỬ NGHIỆM
     */
//    public boolean insertHotspotNavigation(HotspotNavCreateRequest req) {
//        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale) " + "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale)";
//        String sqlInsertNavigation = "INSERT INTO hotspot_navigations(hotspotId, targetNodeId) " + "VALUES(:hotspotId, :targetNodeId)";
//
//        return ConnectionPool.getConnection().inTransaction(handle -> {
//            int idHotspot = handle.createUpdate(sqlInsertHotspot).bind("nodeId", req.getNodeId()).bind("type", req.getType()).bind("iconId", req.getIconId()).bind("posX", req.getPositionX()).bind("posY", req.getPositionY()).bind("posZ", req.getPositionZ()).bind(("pitchX"), req.getPitchX()).bind(("yawY"), req.getYawY()).bind(("rollZ"), req.getRollZ()).bind(("scale"), req.getScale()).executeAndReturnGeneratedKeys().mapTo(Integer.class).one();
//
//            // Navigation.
//            int rows = handle.createUpdate(sqlInsertNavigation).bind("hotspotId", idHotspot).bind("targetNodeId", req.getTargetNodeId()).execute();
//            return rows == 1;
//
//        });
//    }
    public boolean insertHotspotNavigation(List<HotspotNavCreateRequest> req, String nodeId) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity) " + "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity)";
        String sqlInsertNavigation = "INSERT INTO hotspot_navigations(hotspotId, targetNodeId) " + "VALUES(:hotspotId, :targetNodeId)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotNavCreateRequest navReq : req) {
                hotspotBatch.bind("nodeId", Integer.valueOf(nodeId)).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).add();
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
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity) " + "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity)";
        String sqlInsertNavigation = "INSERT INTO hotspot_informations(hotspotId, title, content) " + "VALUES(:hotspotId, :title, :content)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotInfoCreateRequest navReq : req) {
                hotspotBatch.bind("nodeId", Integer.valueOf(nodeId)).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).add();
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
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity, createdAt, updatedAt) " + "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity, :createdAt, :updatedAt)";
        String sqlInsertNavigation = "INSERT INTO hotspot_models(hotspotId, modelUrl, name, description) " + "VALUES(:hotspotId, :modelUrl, :name, :description)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotModelCreateRequest navReq : req) {
                hotspotBatch.bind("nodeId", Integer.valueOf(nodeId)).bind("type", navReq.getType()).bind("iconId", navReq.getIconId()).bind("posX", navReq.getPositionX()).bind("posY", navReq.getPositionY()).bind("posZ", navReq.getPositionZ()).bind("pitchX", navReq.getPitchX()).bind("yawY", navReq.getYawY()).bind("rollZ", navReq.getRollZ()).bind("scale", navReq.getScale()).bind("color", navReq.getColor()).bind("backgroundColor", navReq.getBackgroundColor()).bind("allowBackgroundColor", navReq.getAllowBackgroundColor()).bind("opacity", navReq.getOpacity()).bind("createdAt", Timestamp.valueOf(LocalDateTime.now())).bind("updatedAt", Timestamp.valueOf(LocalDateTime.now())).add();
            }

            List<Integer> generateIds = hotspotBatch.executePreparedBatch().mapTo(Integer.class).list();
            if (generateIds.size() != req.size()) {
                throw new IllegalStateException("[HotspotDao - insertMultipeModel] : Mismatch between hotspot and id return.");
            }

            PreparedBatch navigationBatch = handle.prepareBatch(sqlInsertNavigation);
            for (int i = 0; i < generateIds.size(); i++) {
                navigationBatch.bind("hotspotId", generateIds.get(i)).bind("modelUrl", req.get(i).getModelUrl()).bind("name", req.get(i).getName()).bind("description", req.get(i).getDescription()).add();
            }
            navigationBatch.execute();
            return true;
        });
    }

    public boolean insertHotspotMedia(List<HotspotMediaCreateRequest> reqs, String nodeId) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, color, backgroundColor, allowBackgroundColor, opacity, createdAt, updatedAt) " + "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :color, :backgroundColor, :allowBackgroundColor, :opacity, :createdAt, :updatedAt)";
        String sqlInsertNavigation = "INSERT INTO hotspot_medias(hotspotId, mediaType, mediaUrl, caption, cornerPointList) " + "VALUES(:hotspotId, :mediaType, :mediaUrl, :caption, :cornerPointList)";

        return ConnectionPool.getConnection().inTransaction(handle -> {

            PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

            for (HotspotMediaCreateRequest navReq : reqs) {
                hotspotBatch
                        .bind("nodeId", Integer.valueOf(nodeId))
                        .bind("type", navReq.getType())
                        .bind("iconId", navReq.getIconId())
                        .bind("posX", navReq.getPositionX())
                        .bind("posY", navReq.getPositionY())
                        .bind("posZ", navReq.getPositionZ())
                        .bind("pitchX", navReq.getPitchX())
                        .bind("yawY", navReq.getYawY())
                        .bind("rollZ", navReq.getRollZ())
                        .bind("scale", navReq.getScale())
                        .bind("color", navReq.getColor())
                        .bind("backgroundColor", navReq.getBackgroundColor())
                        .bind("allowBackgroundColor", navReq.getAllowBackgroundColor())
                        .bind("opacity", navReq.getOpacity())
                        .bind("createdAt", Timestamp.valueOf(LocalDateTime.now()))
                        .bind("updatedAt", Timestamp.valueOf(LocalDateTime.now())).add();
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
        String sql = "SELECT h.id, h.nodeId,h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " +
                "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" +
                ", m.mediaType, m.mediaUrl, m.caption, m.cornerPointList " +
                "FROM hotspots AS h JOIN hotspot_medias " +
                "AS m ON h.id = m.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotMediaResponse.class).list();
        });
    }

    public List<HotspotNavigationResponse> getNavigationByNodeId(int nodeId) {
        String sql = "SELECT h.id, h.nodeId, h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " +
                "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" +
                ", n.targetNodeId " +
                "FROM hotspots AS h JOIN hotspot_navigations AS n ON h.id = n.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotNavigationResponse.class).list();
        });
    }

    public List<HotspotInformationResponse> getInformationByNodeId(int nodeId) {
        String sql = "SELECT h.id, h.nodeId, h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " +
                "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" +
                ", i.title, i.content " +
                "FROM hotspots AS h JOIN hotspot_informations AS i ON h.id = i.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotInformationResponse.class).list();
        });
    }


    public List<HotspotModelResponse> getModelByNodeId(int nodeId) {
        String sql = "SELECT h.id, h.nodeId, h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " + "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity, m.modelUrl, m.name, m.description " + "FROM hotspots AS h JOIN hotspot_models " + "AS m ON h.id = m.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotModelResponse.class).list();
        });
    }

    public int updateNavHotspots(List<HotspotNavUpdateRequest> navHotspots, int id) {
        String sqlUpdateHotspot = "UPDATE hotspots SET "
                + "type = :type, iconId = :iconId, positionX = :posX, positionY = :posY, positionZ = :posZ, "
                + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, "
                + "color = :color, backgroundColor = :backgroundColor, "
                + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity "
                + "WHERE id = :id";

        String sqlUpdateNavigation = "UPDATE hotspot_navigations SET targetNodeId = :targetNodeId WHERE hotspotId = :hotspotId";

        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateNavBatch = handle.prepareBatch(sqlUpdateNavigation);

            for (HotspotNavUpdateRequest navReq : navHotspots) {
                updateBaseBatch
                        .bind("id", navReq.getId())
                        .bind("type", navReq.getType())
                        .bind("iconId", navReq.getIconId())
                        .bind("posX", navReq.getPositionX())
                        .bind("posY", navReq.getPositionY())
                        .bind("posZ", navReq.getPositionZ())
                        .bind("pitchX", navReq.getPitchX())
                        .bind("yawY", navReq.getYawY())
                        .bind("rollZ", navReq.getRollZ())
                        .bind("scale", navReq.getScale())
                        .bind("color", navReq.getColor())
                        .bind("backgroundColor", navReq.getBackgroundColor())
                        .bind("allowBackgroundColor", navReq.getAllowBackgroundColor())
                        .bind("opacity", navReq.getOpacity())
                        .add();

                updateNavBatch
                        .bind("hotspotId", navReq.getId())
                        .bind("targetNodeId", Integer.valueOf(navReq.getTargetNodeId()))
                        .add();
            }
            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateNavBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            return totalUpdated + totalInserted;
        });

    }

    public int updateInfoHotspots(List<HotspotInfoUpdateRequest> infoHotspots, int id) {
        String sqlUpdateHotspot = "UPDATE hotspots SET "
                + "type = :type, iconId = :iconId, positionX = :posX, positionY = :posY, positionZ = :posZ, "
                + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, "
                + "color = :color, backgroundColor = :backgroundColor, "
                + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity "
                + "WHERE id = :id";

        String sqlUpdateInfo = "UPDATE hotspot_informations SET title = :title, content = :content WHERE hotspotId = :hotspotId";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateInfoBatch = handle.prepareBatch(sqlUpdateInfo);

            for (HotspotInfoUpdateRequest infoReq : infoHotspots) {
                updateBaseBatch
                        .bind("id", infoReq.getId())
                        .bind("type", infoReq.getType())
                        .bind("iconId", infoReq.getIconId())
                        .bind("posX", infoReq.getPositionX())
                        .bind("posY", infoReq.getPositionY())
                        .bind("posZ", infoReq.getPositionZ())
                        .bind("pitchX", infoReq.getPitchX())
                        .bind("yawY", infoReq.getYawY())
                        .bind("rollZ", infoReq.getRollZ())
                        .bind("scale", infoReq.getScale())
                        .bind("color", infoReq.getColor())
                        .bind("backgroundColor", infoReq.getBackgroundColor())
                        .bind("allowBackgroundColor", infoReq.getAllowBackgroundColor())
                        .bind("opacity", infoReq.getOpacity())
                        .add();

                updateInfoBatch
                        .bind("hotspotId", infoReq.getId())
                        .bind("title", infoReq.getTitle())
                        .bind("content", infoReq.getContent())
                        .add();
            }

            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateInfoBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            return totalUpdated + totalInserted;
        });

    }

    public int updateMediaHotspots(List<HotspotMediaUpdateRequest> mediaHotspots, int id) {
        String sqlUpdateHotspot = "UPDATE hotspots SET "
                + "type = :type, iconId = :iconId, positionX = :posX, positionY = :posY, positionZ = :posZ, "
                + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, "
                + "color = :color, backgroundColor = :backgroundColor, "
                + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity "
                + "WHERE id = :id";

        String sqlUpdateMedia = "UPDATE hotspot_medias SET mediaType = :mediaType, mediaUrl = :mediaUrl, caption = :caption, cornerPointList = :cornerPointList WHERE hotspotId = :hotspotId";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateMediaBatch = handle.prepareBatch(sqlUpdateMedia);

            for (HotspotMediaUpdateRequest mediaReq : mediaHotspots) {
                updateBaseBatch
                        .bind("id", mediaReq.getId())
                        .bind("type", mediaReq.getType())
                        .bind("iconId", mediaReq.getIconId())
                        .bind("posX", mediaReq.getPositionX())
                        .bind("posY", mediaReq.getPositionY())
                        .bind("posZ", mediaReq.getPositionZ())
                        .bind("pitchX", mediaReq.getPitchX())
                        .bind("yawY", mediaReq.getYawY())
                        .bind("rollZ", mediaReq.getRollZ())
                        .bind("scale", mediaReq.getScale())
                        .bind("color", mediaReq.getColor())
                        .bind("backgroundColor", mediaReq.getBackgroundColor())
                        .bind("allowBackgroundColor", mediaReq.getAllowBackgroundColor())
                        .bind("opacity", mediaReq.getOpacity())
                        .add();

                updateMediaBatch
                        .bind("hotspotId", mediaReq.getId())
                        .bind("mediaType", mediaReq.getMediaType())
                        .bind("mediaUrl", mediaReq.getMediaUrl())
                        .bind("caption", mediaReq.getCaption())
                        .bind("cornerPointList", mediaReq.getCornerPointList())
                        .add();
            }

            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateMediaBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            return totalUpdated + totalInserted;

        });
    }

    public int updateModelHotspots(List<HotspotModelUpdateRequest> modelHotspots, int id) {
        String sqlUpdateHotspot = "UPDATE hotspots SET "
                + "type = :type, iconId = :iconId, positionX = :posX, positionY = :posY, positionZ = :posZ, "
                + "pitchX = :pitchX, yawY = :yawY, rollZ = :rollZ, scale = :scale, "
                + "color = :color, backgroundColor = :backgroundColor, "
                + "allowBackgroundColor = :allowBackgroundColor, opacity = :opacity "
                + "WHERE id = :id";
        String sqlUpdateModel = "UPDATE hotspot_models SET modelUrl = :modelUrl, name = :name, description = :description WHERE hotspotId = :hotspotId";
        return ConnectionPool.getConnection().inTransaction(handle -> {
            PreparedBatch updateBaseBatch = handle.prepareBatch(sqlUpdateHotspot);
            PreparedBatch updateModelBatch = handle.prepareBatch(sqlUpdateModel);

            for (HotspotModelUpdateRequest modelReq : modelHotspots) {
                updateBaseBatch
                        .bind("id", modelReq.getId())
                        .bind("type", modelReq.getType())
                        .bind("iconId", modelReq.getIconId())
                        .bind("posX", modelReq.getPositionX())
                        .bind("posY", modelReq.getPositionY())
                        .bind("posZ", modelReq.getPositionZ())
                        .bind("pitchX", modelReq.getPitchX())
                        .bind("yawY", modelReq.getYawY())
                        .bind("rollZ", modelReq.getRollZ())
                        .bind("scale", modelReq.getScale())
                        .bind("color", modelReq.getColor())
                        .bind("backgroundColor", modelReq.getBackgroundColor())
                        .bind("allowBackgroundColor", modelReq.getAllowBackgroundColor())
                        .bind("opacity", modelReq.getOpacity())
                        .add();

                updateModelBatch
                        .bind("hotspotId", modelReq.getId())
                        .bind("modelUrl", modelReq.getModelUrl())
                        .bind("name", modelReq.getName())
                        .bind("description", modelReq.getDescription())
                        .add();
            }
            int[] updateResults = updateBaseBatch.execute();
            int[] insertResults = updateModelBatch.execute();

            int totalUpdated = Arrays.stream(updateResults).sum();
            int totalInserted = Arrays.stream(insertResults).sum();

            return totalUpdated + totalInserted;
        });
    }

}
