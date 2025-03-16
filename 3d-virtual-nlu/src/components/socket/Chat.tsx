import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./Chat.module.css";
import { useUser } from "../Contect.tsx";

const Chat = () => {
    // const { roomId, userId } = useParams(); // Lấy roomId & userId từ URL
    const {user} = useUser();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [inputMessage, setInputMessage] = useState("");

    useEffect(() => {
        // if (!roomId || !userId) return;
        if (!user) return;

        const wsUrl = `ws://localhost:8080/chat/1/${user?.id}`;
        console.log('wsUrl',wsUrl)
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log(`Connected to room 1 as user ${user?.id}`);
        };

        ws.onmessage = (event) => {
            console.log("Received:", event.data);
            const [sender, text] = event.data.split(": ", 2);
            setMessages((prev) => [...prev, { sender, text }]);
        };

        ws.onclose = () => {
            console.log(`User ${user?.id} disconnected from room 1`);
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [user]);
    // }, [roomId, userId]);

    const sendMessage = () => {
        console.log("socket",socket)
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(inputMessage);
            setInputMessage("");
        } else {
            console.error("WebSocket is not connected.");
        }
    };

    return (
        <div className={styles.chatBox}>
            <h2>Chat Room: 1</h2>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </p>
                ))}
            </div>
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;
