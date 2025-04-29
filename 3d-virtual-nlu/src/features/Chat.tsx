import { useEffect, useState, useRef } from "react";
import styles from "../styles/chat.module.css";
// import { useUser } from "../Context.tsx";
import { IoIosClose, IoIosCloseCircle, IoMdSend } from "react-icons/io";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import { FaMessage, FaXmark } from "react-icons/fa6";

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

  const [isOpenBox, setIsOpenBox] = useState(false);
  const [isFillInput, setIsFillInput] = useState(false);
  const [isSelectOption, setIsSelectOption] = useState(0);

  useEffect(() => {
 
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

  const handleOpenChatBox = () => {
    setIsOpenBox((preState) => !preState);
  };

  const handleCheckFillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    setIsFillInput(value.trim() !== "");
  };

  const handleChooseOption = (index: number) => {
    setIsSelectOption(index);
  };

  useEffect(() => {
    if (messagesRef.current) {
      // Scroll xuống dưới cùng
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.chat}>
      <div
        className={`${styles.chatBox} ${isOpenBox ? styles.openBox : ""}`}
        onScroll={handleScroll}
        ref={messagesRef}
      >
        <div className={styles.decor1}></div>
        <div className={styles.decor2}></div>
        <div className={styles.option}>
          <div
            className={`${styles.chat_option} ${
              isSelectOption === 0 ? styles.choose_option : ""
            }`}
            onClick={() => handleChooseOption(0)}
          >
            <FaMessage />
            <span>Chat</span>
          </div>
          <div
            className={`${styles.chat_option} ${
              isSelectOption === 1 ? styles.choose_option : ""
            }`}
            onClick={() => handleChooseOption(1)}
          >
            <FaMessage />
            <span>Help</span>
          </div>
        </div>
        {isSelectOption == 0 ? (
          <>
            <div className={styles.chatContent}>
              {messages.map((msg, index) => {
                const isMine = msg.username === user?.username;
                return (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {!isMine && (
                      <div className={styles.otherAccount}>
                        <div className={styles.avatar}>
                          {msg.username.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div
                      key={index}
                      className={`${styles.message} ${
                        isMine ? styles.myMessage : styles.otherMessage
                      }`}
                    >
                      <span>{msg.content}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <input
              className={styles.chatInput}
              type="text"
              value={inputMessage}
              onChange={handleCheckFillInput}
              placeholder="Compose your message..."
            />
            <button
              className={`${styles.sendChatBtn} ${
                isFillInput ? styles.show : ""
              }`}
              onClick={sendMessage}
            >
              <IoMdSend />
            </button>
          </>
        ) : (
          <>
          </>
        )}
      </div>
      <div className={styles.chatIcon} onClick={handleOpenChatBox}>
        {isOpenBox ? (
          <FaXmark style={{ color: "white" }} />
        ) : (
          <FaMessage style={{ color: "white" }} />
        )}
      </div>
    </div>
  );
};

export default Chat;
