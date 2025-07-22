package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.dao.IconDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
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

    public boolean changeThumbnail(ThumbnailRequest req) {
        try {
            return iconDao.changeThumbnail(req);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
