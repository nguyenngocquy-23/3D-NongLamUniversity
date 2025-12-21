package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.config.CacheManager;
import vn.edu.hcmuaf.virtualnluapi.dao.FieldDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.ChangeNameRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.PageRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class FieldService {
    @Inject
    FieldDao fieldDao;
    @Inject
    CacheManager cache;

    public boolean createField(FieldCreateRequest req) {
        boolean ok = fieldDao.insertField(req);
        if (ok) {
            cache.invalidate("field-admin:all");
            cache.invalidate("field-visitor:all");
            cache.invalidate("field:page:0:limit:10");
        }
        return ok;
    }

    public List<FieldResponse> getAllFields() {
        String key = "field-admin:all";

        List<FieldResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<FieldResponse> result = fieldDao.getAllFields();

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public List<FieldResponse> getAllFieldsInVisitor() {
        String key = "field-visitor:all";

        List<FieldResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<FieldResponse> result = fieldDao.getAllFieldsInVisitor();

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public List<FieldResponse> getFieldsByPage(PageRequest request) {
        String key = "field:page:" + request.getPage()
                + ":limit:" + request.getLimit();

        List<FieldResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<FieldResponse> result = fieldDao.getFieldsByPage(request);

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public FieldResponse getFieldById(int id) {
        return fieldDao.getFieldById(id);
    }

    public boolean changeStatusField(StatusRequest req) {
        return fieldDao.changeStatusField(req);
    }

    public boolean changeNameField(ChangeNameRequest req) {
        return fieldDao.changeNameField(req);
    }

    public List<FieldResponse> search(String searchKey) {
        String key = "field:search:" + searchKey.toLowerCase();

        List<FieldResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<FieldResponse> result = fieldDao.search(searchKey);
            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
