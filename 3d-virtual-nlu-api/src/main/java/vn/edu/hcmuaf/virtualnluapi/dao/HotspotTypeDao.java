package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.ConnectionPool;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.HotspotType;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class HotspotTypeDao {
    public List<HotspotType> getAllType() {
        return ConnectionPool.getConnection().withHandle(handle -> {
            return handle.createQuery("SELECT id, name, DefaultIconId, updatedAt FROM hotspot_types order by id")
                    .mapToBean(HotspotType.class)
                    .list();
        });
    }

//    public boolean changeIconDefault(Request req) {
//    }
}
