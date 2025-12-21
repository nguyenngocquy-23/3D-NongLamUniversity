package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.hcmuaf.virtualnluapi.config.CacheManager;
import vn.edu.hcmuaf.virtualnluapi.dao.ContactDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.*;
import vn.edu.hcmuaf.virtualnluapi.dto.response.ContactResponse;
import vn.edu.hcmuaf.virtualnluapi.dto.response.NodeFullResponse;

import java.util.List;

@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class ContactService {
    @Inject
    ContactDao contactDao;
    @Inject
    MailService mailService;
    @Inject
    CacheManager cache;

    public boolean sendContact(SendContactRequest req) {
        boolean ok = contactDao.sendContact(req);
        if (ok) {
            cache.invalidate("contact:all");
        }
        return ok;
    }

    public List<ContactResponse> getAllContact() {
        String key = "contact:all";

        List<ContactResponse> cached = cache.get(key, List.class);
        if (cached != null) {
            return cached;
        }

        try {
            List<ContactResponse> result =
                    contactDao.getAllContact();

            cache.put(key, result);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public Boolean feedback(FeedbackContactRequest request) {
        boolean ok = contactDao.feedback(request);
        if (ok) {
            mailService.sendMailReplyContact(request); // async càng tốt
            cache.invalidate("contact:all");
        }
        return ok;
    }
}
