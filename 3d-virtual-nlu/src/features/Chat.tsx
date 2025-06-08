import { useEffect, useState, useRef } from "react";
import styles from "../styles/chat.module.css";
// import { useUser } from "../Context.tsx";
import { IoIosClose, IoIosCloseCircle, IoMdSend } from "react-icons/io";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import { FaMessage, FaXmark } from "react-icons/fa6";

const Chat = ({ nodeId }: { nodeId: number }) => {
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

  // cờ để kiểm tra có load tin nhắn cũ không, nếu không thì sẽ nhận tin nhắn mới khi nhắn và scroll dưới cùng
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMessages([]);
    const wsUrl = `ws://localhost:8080/chat/${nodeId}/${user?.id}`;
    console.log("wsUrl", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to node ${nodeId} as user ${user?.id}`);
      loadMessages(0);
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
      const [username, content] = event.data.split(": ", 2);
      setMessages((prev) => [...prev, { username, content }]);
    };

    ws.onclose = () => {
      console.log(`User ${user?.id} disconnected from node ${nodeId}`);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [nodeId]);

  const scrollPositionRef = useRef<number>(0);

  const handleScroll = () => {
    const container = messagesRef.current;
    if (container && container.scrollTop === 0) {
      scrollPositionRef.current = container.scrollHeight;
      loadMessages(page + 1);
    }
  };

  const loadMessages = async (newPage: number) => {
    const container = messagesRef.current;
    if (!container) return;

    const prevScrollHeight = container.scrollHeight;
    setIsLoadingMore(true); // -> Đánh dấu là đang load thêm ở trên
    const response = await axios.get(
      `http://localhost:8080/api/chat/messages?nodeId=${nodeId}&page=${newPage}&limit=6`
    );
    const data = response.data;

    setMessages((prev) => {
      return [...data.reverse(), ...prev]; // prepend
    });
    setPage(newPage);

    // Đợi render xong rồi giữ nguyên scroll
    setTimeout(() => {
      if (messagesRef.current) {
        const newScrollHeight = messagesRef.current.scrollHeight;
        const delta = newScrollHeight - prevScrollHeight;
        messagesRef.current.scrollTop += delta; // giữ nguyên vị trí tin nhắn cũ
      }
      setIsLoadingMore(false); // Đặt sau scroll để tránh scrollBottom từ useEffect
    }, 20);
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
    if (!messagesRef.current) return;

    // Nếu không phải đang load thêm (tức là tin nhắn mới gửi hoặc nhận)
    if (!isLoadingMore) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
    // Nếu đang load tin nhắn cũ, ta đã xử lý scroll riêng rồi trong loadMessages()
  }, [messages.length, isSelectOption]);

  return (
    <div className={styles.chat}>
      <div className={`${styles.chatBox} ${isOpenBox ? styles.openBox : ""}`}>
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
            <span>All</span>
          </div>
          <div
            className={`${styles.chat_option} ${
              isSelectOption === 2 ? styles.choose_option : ""
            }`}
            onClick={() => handleChooseOption(2)}
          >
            <FaMessage />
            <span>Help</span>
          </div>
        </div>
        {isSelectOption == 0 || isSelectOption == 1 ? (
          <>
            <div
              className={styles.chatContent}
              onScroll={handleScroll}
              ref={messagesRef}
            >
              {messages.map((msg, index) => {
                const isMine = msg.username === user?.username;
                return (
                  <div
                    key={index}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {!isMine && (
                      <div className={styles.otherAccount}>
                        <div className={styles.avatar}>
                          {msg.username.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div
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
          <></>
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
