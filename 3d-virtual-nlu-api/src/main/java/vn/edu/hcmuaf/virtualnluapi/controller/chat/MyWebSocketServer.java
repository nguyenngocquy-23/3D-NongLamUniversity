package vn.edu.hcmuaf.virtualnluapi.controller.chat;

import jakarta.inject.Inject;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import vn.edu.hcmuaf.virtualnluapi.dto.request.MessageRequest;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.service.MessageService;
import vn.edu.hcmuaf.virtualnluapi.service.UserService;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/chat/{nodeId}/{userId}")
public class MyWebSocketServer {
    private MessageService messageService = new MessageService();
    @Inject
    private UserService userDAO;

    private static final Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("nodeId") String nodeId, @PathParam("userId") String userId) {
        String sessionKey = nodeId + "_" + userId;
        sessions.put(sessionKey, session);
        System.out.println("User " + userId + " connected to node " + nodeId);

        // Gửi ping sau 10 giây để giữ kết nối
        new Thread(() -> {
            while (session.isOpen()) {
                try {
                    Thread.sleep(10000);
                    session.getBasicRemote().sendPing(ByteBuffer.allocate(0)); // Gửi ping giữ kết nối
                } catch (Exception e) {
                    System.err.println("Ping failed: " + e.getMessage());
                    break;
                }
            }
        }).start();
    }

    @OnMessage
    public void onMessage(String message, Session session, @PathParam("nodeId") String nodeId, @PathParam("userId") String userId) {
        // Xử lý tin nhắn từ người dùng
        System.out.println("Received message from user " + userId + " in node " + nodeId + ": " + message);

        try{
            // Lưu tin nhắn vào cơ sở dữ liệu
            saveMessageToDatabase(nodeId, userId, message);

            // Gửi tin nhắn đến tất cả người dùng trong phòng
            broadcastMessage(nodeId, userId, message);
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("nodeId") String nodeId, @PathParam("userId") String userId) throws IOException {
        String sessionKey = nodeId + "_" + userId;
        if (session.isOpen()) {
            session.close();
        }
        sessions.remove(sessionKey);
        System.out.println("User " + userId + " disconnected from node " + nodeId);
    }


    @OnError
    public void onError(Session session, Throwable throwable) {
        // Xử lý lỗi
        System.err.println("WebSocket error: " + throwable.getMessage());
    }

    private void saveMessageToDatabase(String nodeId, String userId, String content) {
        MessageRequest messageDTO = MessageRequest.builder()
                .nodeId(Integer.parseInt(nodeId))
                .userId(Integer.parseInt(userId))
                .content(content)
                .build();

        // Gọi repository hoặc DAO để lưu tin nhắn
        messageService.sendMessage(messageDTO);
    }

    private void broadcastMessage(String nodeId, String userId, String message) {
        User user = userDAO.findById(Integer.parseInt(userId));
        String formattedMessage = user.getUsername() + ": " + message;
        sessions.forEach((key, session) -> {
            if (key.startsWith(nodeId + "_")) {
                try {
                    if (session.isOpen()) {
                        session.getBasicRemote().sendText(formattedMessage);
                        session.getBasicRemote().flushBatch();
                        System.out.println("Sent to " + key + ": " + formattedMessage);
                    }
                } catch (IOException e) {
                    System.err.println("Error sending message to user " + key + ": " + e.getMessage());
                }
            }
        });
    }

}