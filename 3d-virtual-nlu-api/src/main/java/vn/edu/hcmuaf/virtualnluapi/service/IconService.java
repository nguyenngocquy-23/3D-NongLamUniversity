package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.dao.IconDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.IconCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;

import java.util.List;


@ApplicationScoped
public class IconService {
    @Inject
    private IconDao iconDao;



    public List<IconResponse> getAllIcons() {
        return iconDao.getAllIcons();
    }

    public boolean createIcon(IconCreateRequest req) {
        return iconDao.createIcon(req);
    }
}
