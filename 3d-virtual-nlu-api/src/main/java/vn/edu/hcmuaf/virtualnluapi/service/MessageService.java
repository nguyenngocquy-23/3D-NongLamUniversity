package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.dao.MessageDao;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.MessageRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.MessageResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.User;

import java.util.List;

@ApplicationScoped
public class MessageService {
    private MessageDao messageDAO = new MessageDao();

    private UserDao userDAO = new UserDao();

    public void sendMessage(MessageRequest messageRequest) {
        messageDAO.insertMessage(messageRequest);
    }
    public List<MessageResponse> getMessages(int nodeId, int limit, int offset) {
        List<MessageResponse> result = messageDAO.findMessages(nodeId, limit, offset);
        for (MessageResponse message : result) {
            User user = userDAO.findById(message.getUserId());
            message.setUsername(user.getUsername());
        }
        return result;
    }

}
