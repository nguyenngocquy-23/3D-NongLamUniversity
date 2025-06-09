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

    // Lưu session theo nodeId → userId → session
    private static final Map<String, Map<String, Session>> nodeSessions = new ConcurrentHashMap<>();
    // Danh sách session tham gia chat tổng
    private static final Map<String, Session> globalSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session,
                       @PathParam("nodeId") String nodeId,
                       @PathParam("userId") String userId) {
        if ("global".equals(nodeId)) {
            globalSessions.put(userId, session);
            System.out.println("User " + userId + " connected to GLOBAL chat");
        } else {
            nodeSessions
                    .computeIfAbsent(nodeId, k -> new ConcurrentHashMap<>())
                    .put(userId, session);
            System.out.println("User " + userId + " connected to node " + nodeId);
            broadcastCount(nodeId);
        }

        // Ping giữ kết nối
        new Thread(() -> {
            while (session.isOpen()) {
                try {
                    Thread.sleep(10000);
                    session.getBasicRemote().sendPing(ByteBuffer.allocate(0));
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
            if ("global".equals(nodeId)) {
                broadcastGlobalMessage(userId, message);
            } else {
                saveMessageToDatabase(nodeId, userId, message);
                broadcastMessage(nodeId, userId, message);
            }
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }

    @OnClose
    public void onClose(Session session,
                        @PathParam("nodeId") String nodeId,
                        @PathParam("userId") String userId) {
        if ("global".equals(nodeId)) {
            globalSessions.remove(userId);
            System.out.println("User " + userId + " disconnected from GLOBAL chat");
        } else {
            Map<String, Session> users = nodeSessions.get(nodeId);
            if (users != null) {
                users.remove(userId);
                if (users.isEmpty()) {
                    nodeSessions.remove(nodeId);
                }
            }
            System.out.println("User " + userId + " disconnected from node " + nodeId);
            broadcastCount(nodeId);
        }
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
        String formattedMessage = user.getAvatar() + ": " + user.getUsername() + ": " + message;

        Map<String, Session> users = nodeSessions.get(nodeId);
        if (users != null) {
            for (Map.Entry<String, Session> entry : users.entrySet()) {
                Session session = entry.getValue();
                if (session.isOpen()) {
                    try {
                        session.getBasicRemote().sendText(formattedMessage);
                        System.out.println("Sent to " + entry.getKey() + ": " + formattedMessage);
                    } catch (IOException e) {
                        System.err.println("Error sending message to " + entry.getKey() + ": " + e.getMessage());
                    }
                }
            }
        }
    }

    private void broadcastGlobalMessage(String userId, String message) {
        User user = userDAO.findById(Integer.parseInt(userId));
        String formattedMessage = user.getAvatar() + ": " + user.getUsername() + ": " + message;

        for (Map.Entry<String, Session> entry : globalSessions.entrySet()) {
            Session session = entry.getValue();
            if (session.isOpen()) {
                try {
                    session.getBasicRemote().sendText(formattedMessage);
                    System.out.println("Sent to (global) " + entry.getKey() + ": " + formattedMessage);
                } catch (IOException e) {
                    System.err.println("Error sending to global " + entry.getKey() + ": " + e.getMessage());
                }
            }
        }
    }

    private void broadcastCount(String nodeId) {
        Map<String, Session> users = nodeSessions.get(nodeId);
        int count = users != null ? users.size() : 0;
        String message = "COUNT:" + count;

        if (users != null) {
            for (Session s : users.values()) {
                if (s.isOpen()) {
                    try {
                        s.getBasicRemote().sendText(message);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}