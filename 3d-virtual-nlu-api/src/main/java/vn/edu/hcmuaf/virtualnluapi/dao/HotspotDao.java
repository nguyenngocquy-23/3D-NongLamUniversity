package vn.edu.hcmuaf.virtualnluapi.dao;


import jakarta.enterprise.context.ApplicationScoped;
import org.jdbi.v3.core.statement.PreparedBatch;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotInformationResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotMediaResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotModelResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.HotspotNavigationResponse;

import java.sql.Timestamp;
import java.time.LocalDateTime;
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

    public List<HotspotModelResponse> getModelByNodeId(int nodeId) {
        String sql = "SELECT h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " + "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity, m.modelUrl, m.name, m.description " + "FROM hotspots AS h JOIN hotspot_models " + "AS m ON h.id = m.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotModelResponse.class).list();
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
        String sql = "SELECT h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " +
                "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" +
                ", m.mediaType, m.mediaUrl, m.caption, m.cornerPointList " +
                "FROM hotspots AS h JOIN hotspot_medias " +
                "AS m ON h.id = m.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotMediaResponse.class).list();
        });
    }

    public List<HotspotNavigationResponse> getNavigationByNodeId(int nodeId) {
        String sql = "SELECT h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " +
                "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" +
                ", n.targetNodeId " +
                "FROM hotspots AS h JOIN hotspot_navigations AS n ON h.id = n.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotNavigationResponse.class).list();
        });
    }

    public List<HotspotInformationResponse> getInformationByNodeId(int nodeId) {
        String sql = "SELECT h.type, h.iconId, h.positionX, h.positionY, h.positionZ, " +
                "h.pitchX, h.yawY, h.rollZ, h.scale, h.color, h.backgroundColor, h.allowBackgroundColor, h.opacity" +
                ", i.title, i.content " +
                "FROM hotspots AS h JOIN hotspot_informations AS i ON h.id = i.hotspotId WHERE h.nodeId = :nodeId";
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery(sql).bind("nodeId", nodeId).mapToBean(HotspotInformationResponse.class).list();
        });
    }
}
