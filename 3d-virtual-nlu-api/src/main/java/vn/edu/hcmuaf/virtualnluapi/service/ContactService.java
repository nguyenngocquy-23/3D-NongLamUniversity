package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.dao.ContactDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class ContactService {
    @Inject
    ContactDao contactDao;

    public boolean sendContact(SendContactRequest req) {
        try {
            return contactDao.sendContact(req);
        }catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<ContactResponse> getAllContact() {
        try {
            return contactDao.getAllContact();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
