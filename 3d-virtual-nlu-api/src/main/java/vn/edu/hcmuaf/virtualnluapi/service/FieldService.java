package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.FieldDao;
import vn.edu.hcmuaf.virtualnluapi.dao.SpaceDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.FieldCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.SpaceCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.FieldResponse;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class FieldService {
    @Inject
    FieldDao fieldDao;

    public boolean createField(FieldCreateRequest req) {
        return fieldDao.insertField(req);
    }

    public List<FieldResponse> getFields() {
        return fieldDao.getFields();
    }
}
