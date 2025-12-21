package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.config.CacheManager;
import vn.edu.hcmuaf.virtualnluapi.dao.FieldDao;
import vn.edu.hcmuaf.virtualnluapi.dao.HotspotTypeDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.HotspotType;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class HotspotTypeService {
    @Inject
    HotspotTypeDao hotspotTypeDao;
    @Inject
    CacheManager cache;

    public List<HotspotType> getAllType() {
        String key = "hotspotType:all";

        List<HotspotType> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<HotspotType> result = hotspotTypeDao.getAllType();

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

//    public FieldResponse getIconDefaultById(int id) {
//        return HotspotTypeDao.getFieldById(id);
//    }

//    public boolean changeIconDefault(Request req) {
//        return HotspotTypeDao.changeStatusField(req);
//    }
}
