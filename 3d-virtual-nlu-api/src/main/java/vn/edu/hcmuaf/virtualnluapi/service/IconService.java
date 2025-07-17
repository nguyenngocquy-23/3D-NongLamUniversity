package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.dao.IconDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.ChangeNameRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.IconCreateRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.PageRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.StatusRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.IconResponse;

import java.util.List;


@ApplicationScoped
public class IconService {
    @Inject
    private IconDao iconDao;



    public List<IconResponse> getAllIcons() {
        try {
            return iconDao.getAllIcons();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public boolean createIcon(IconCreateRequest req) {
        try{
            return iconDao.createIcon(req);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<IconResponse> search(String searchKey) {
        try {
            return iconDao.search(searchKey);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public boolean changeStatusIcon(StatusRequest req) {
        try {
            return iconDao.changeStatusIcon(req);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean changeNameIcon(ChangeNameRequest req) {
        try {
            return iconDao.changeNameIcon(req);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
