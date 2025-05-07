package vn.edu.hcmuaf.virtualnluapi.dao;


import jakarta.enterprise.context.ApplicationScoped;
import org.jdbi.v3.core.statement.PreparedBatch;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotModelCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.HotspotNavCreateRequest;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class HotspotDao {

    /**
     * Thêm 1 hotspot vào DB.
     */
    public boolean insertHotspotNavigation(HotspotNavCreateRequest req) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale) " +
                "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale)";
        String sqlInsertNavigation = "INSERT INTO hotspot_navigations(hotspotId, targetNodeId) " +
                "VALUES(:hotspotId, :targetNodeId)";

        return ConnectionPool.getConnection().inTransaction(
                handle -> {
                    int idHotspot = handle.createUpdate(sqlInsertHotspot)
                            .bind("nodeId", req.getNodeId())
                            .bind("type", req.getType())
                            .bind("iconId", req.getIconId())
                            .bind("posX", req.getPositionX())
                            .bind("posY", req.getPositionY())
                            .bind("posZ", req.getPositionZ())
                            .bind(("pitchX"), req.getPitchX())
                            .bind(("yawY"), req.getYawY())
                            .bind(("rollZ"), req.getRollZ())
                            .bind(("scale"), req.getScale())
                            .executeAndReturnGeneratedKeys()
                            .mapTo(Integer.class)
                            .one();

                    // Navigation.
                    int rows = handle.createUpdate(sqlInsertNavigation)
                            .bind("hotspotId", idHotspot)
                            .bind("targetNodeId", req.getTargetNodeId())
                            .execute();
                    return rows == 1;

                }
        );
    }

    /**
     * thêm 1 danh sách các hotspot naviagtion vào DB.
     */
    public boolean insertHotspotNavigation(List<HotspotNavCreateRequest> req) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale) " +
                "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale)";
        String sqlInsertNavigation = "INSERT INTO hotspot_navigations(hotspotId, targetNodeId) " +
                "VALUES(:hotspotId, :targetNodeId)";

        return ConnectionPool.getConnection().inTransaction(
                handle -> {

                    PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

                    for (HotspotNavCreateRequest navReq : req) {
                        hotspotBatch.bind("nodeId", navReq.getNodeId())
                                .bind("type", navReq.getType())
                                .bind("iconId", navReq.getIconId())
                                .bind("posX", navReq.getPositionX())
                                .bind("posY", navReq.getPositionY())
                                .bind("posZ", navReq.getPositionZ())
                                .bind("pitchX", navReq.getPitchX())
                                .bind("yawY", navReq.getYawY())
                                .bind("rollZ", navReq.getRollZ())
                                .bind("scale", navReq.getScale())
                                .add();
                    }

                    List<Integer> generateIds = hotspotBatch.executePreparedBatch().mapTo(Integer.class).list();
                    if (generateIds.size() != req.size()) {
                        throw new IllegalStateException("[HotspotDao - insertMultipeNav] : Mismatch between hotspot and id return.");
                    }

                    PreparedBatch navigationBatch = handle.prepareBatch(sqlInsertNavigation);
                    for (int i = 0; i < generateIds.size(); i++) {
                        navigationBatch.bind("hotspotId", i)
                                .bind("targetNodeId", req.get(i).getTargetNodeId())
                                .add();
                    }
                    navigationBatch.execute();
                    return true;
                }
        );
    }

    /**
     * thêm danh sách hotspot model.
     */
    public boolean insertHotspotModel(List<HotspotModelCreateRequest> req) {
        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale, createdAt, updatedAt) " +
                "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale, :createdAt, :updatedAt)";
        String sqlInsertNavigation = "INSERT INTO hotspot_models(hotspotId, modelUrl, name, description) " +
                "VALUES(:hotspotId, :modelUrl, :name, :description)";

        return ConnectionPool.getConnection().inTransaction(
                handle -> {

                    PreparedBatch hotspotBatch = handle.prepareBatch(sqlInsertHotspot);

                    for (HotspotModelCreateRequest navReq : req) {
//                        hotspotBatch.bind("nodeId", navReq.getNodeId())
                        hotspotBatch.bind("nodeId", 1)
                                .bind("type", navReq.getType())
                                .bind("iconId", navReq.getIconId())
                                .bind("posX", navReq.getPositionX())
                                .bind("posY", navReq.getPositionY())
                                .bind("posZ", navReq.getPositionZ())
                                .bind("pitchX", navReq.getPitchX())
                                .bind("yawY", navReq.getYawY())
                                .bind("rollZ", navReq.getRollZ())
                                .bind("scale", navReq.getScale())
                                .bind("createdAt", Timestamp.valueOf(LocalDateTime.now()))
                                .bind("updatedAt", Timestamp.valueOf(LocalDateTime.now()))
                                .add();
                    }

                    List<Integer> generateIds = hotspotBatch.executePreparedBatch().mapTo(Integer.class).list();
                    if (generateIds.size() != req.size()) {
                        throw new IllegalStateException("[HotspotDao - insertMultipeModel] : Mismatch between hotspot and id return.");
                    }

                    PreparedBatch navigationBatch = handle.prepareBatch(sqlInsertNavigation);
                    for (int i = 0; i < generateIds.size(); i++) {
                        navigationBatch.bind("hotspotId", generateIds.get(i))
                                .bind("modelUrl", req.get(i).getModelUrl())
                                .bind("name", req.get(i).getName())
                                .bind("description", req.get(i).getDescription())
                                .add();
                    }
                    navigationBatch.execute();
                    return true;
                }
        );
    }
//
//    public boolean insertHotspotModel(HotspotModelCreateRequest req) {
//        String sqlInsertHotspot = "INSERT INTO hotspots(nodeId, type, iconId, positionX, positionY, positionZ, pitchX, yawY, rollZ, scale) " +
//                "VALUES(:nodeId, :type, :iconId, :posX, :posY, :posZ, :pitchX, :yawY, :rollZ, :scale)";
//        String sqlInsertModel = "INSERT INTO hotspot_models(hotspotId, modelUrl, name, description) " +
//                "VALUES(:hotspotId, :targetNodeId, :modelUrl, :name, :description)";
//
//        return ConnectionPool.getConnection().inTransaction(
//                handle -> {
//                    int idHotspot = handle.createUpdate(sqlInsertHotspot)
//                            .bind("nodeId", req.getNodeId())
//                            .bind("type", req.getType())
//                            .bind("iconId", req.getIconId())
//                            .bind("posX", req.getPositionX())
//                            .bind("posY", req.getPositionY())
//                            .bind("posZ", req.getPositionZ())
//                            .bind(("pitchX"), req.getPitchX())
//                            .bind(("yawY"), req.getYawY())
//                            .bind(("rollZ"), req.getRollZ())
//                            .bind(("scale"), req.getScale())
//                            .executeAndReturnGeneratedKeys()
//                            .mapTo(Integer.class)
//                            .one();
//
//                    // Navigation.
//                    int rows = handle.createUpdate(sqlInsertModel)
//                            .bind("hotspotId", idHotspot)
//                            .bind("modelUrl", req.getModelUrl())
//                            .bind("name", req.getName())
//                            .bind("description", req.getDescription())
//                            .execute();
//                    return rows == 1;
//                }
//        );
//    }

}
