package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.config.CacheManager;
import vn.edu.hcmuaf.virtualnluapi.dao.IconDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;

import java.util.List;


@ApplicationScoped
public class IconService {
    @Inject
    private IconDao iconDao;
    @Inject
    CacheManager cache;

    public List<IconResponse> getAllIcons() {
        String key = "icon:all";

        List<IconResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<IconResponse> result = iconDao.getAllIcons();

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public boolean createIcon(IconCreateRequest req) {
        try {
            boolean ok = iconDao.createIcon(req);
            if (ok) {
                cache.invalidate("iconn:all");
            }
            return ok;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<IconResponse> search(String searchKey) {
        String key = "icon:search:" + searchKey.toLowerCase();

        List<IconResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<IconResponse> result = iconDao.search(searchKey);
            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public boolean changeStatusIcon(StatusRequest req) {
        try {
            boolean ok = iconDao.changeStatusIcon(req);
            if (ok) {
                cache.invalidate("iconn:all");
            }
            return ok;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean changeNameIcon(ChangeNameRequest req) {
        try {
            boolean ok = iconDao.changeNameIcon(req);
            if (ok) {
                cache.invalidate("iconn:all");
            }
            return ok;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean changeThumbnail(ThumbnailRequest req) {
        try {
            boolean ok = iconDao.changeThumbnail(req);
            if (ok) {
                cache.invalidate("iconn:all");
            }
            return ok;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
