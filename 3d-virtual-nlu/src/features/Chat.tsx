import { useEffect, useState, useRef } from "react";
import styles from "../styles/chat.module.css";
// import { useUser } from "../Context.tsx";
import { IoIosCloseCircle, IoMdSend } from "react-icons/io";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";

const Chat = () => {
  // const { roomId, userId } = useParams(); // Lấy roomId & userId từ URL
  const user = useSelector((state: RootState) => state.auth.user);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<
    { username: string; content: string }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [page, setPage] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // if (!roomId || !userId) return;
    if (!user) return;

    const wsUrl = `ws://localhost:8080/chat/1/${user?.id}`;
    console.log("wsUrl", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to room 1 as user ${user?.id}`);
      loadMessages(0);
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
      const [username, content] = event.data.split(": ", 2);
      setMessages((prev) => [...prev, { username, content }]);
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
  }, []);
  // }, [roomId, userId]);

  const loadMessages = async (newPage: number) => {
    const response = await axios.get(
      `http://localhost:8080/api/chat/messages?roomId=1&page=${newPage}&limit=5`
    );
    const data = response.data;
    console.log("data", data);
    setMessages((prev) => [...data.reverse(), ...prev]); // Thêm vào đầu danh sách
    setPage(newPage);
  };

  const handleScroll = () => {
    if (messagesRef.current?.scrollTop === 0) {
      loadMessages(page + 1);
    }
  };

  const sendMessage = () => {
    console.log("socket", socket);
    if (inputMessage.trim() !== "") {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(inputMessage);
        setInputMessage("");
      } else {
        console.error("WebSocket is not connected.");
      }
    }
  };

  const openChatBox = () => {};

  return (
    <div className={styles.chatBox} onScroll={handleScroll} ref={messagesRef}>
      <div className={styles.backChat}>
        <IoIosCloseCircle />
      </div>
      <div className={styles.chatContent}>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.username}:</strong> {msg.content}
          </p>
        ))}
      </div>
      <input
        className={styles.chatInput}
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button className={styles.sendChatBtn} onClick={sendMessage}>
        <IoMdSend />
      </button>
    </div>
  );
};

export default Chat;
