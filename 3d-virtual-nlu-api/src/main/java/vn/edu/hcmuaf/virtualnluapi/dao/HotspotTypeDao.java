package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.HikariCP;
import vn.edu.hcmuaf.virtualnluapi.entity.HotspotType;

import java.util.List;

@ApplicationScoped
public class HotspotTypeDao {
    public List<HotspotType> getAllType() {
        return HikariCP.getJdbi().withHandle(handle -> {
            return handle.createQuery("SELECT id, name, DefaultIconId, updatedAt FROM hotspot_types order by id")
                    .mapToBean(HotspotType.class)
                    .list();
        });
    }

//    public boolean changeIconDefault(Request req) {
//    }
}
