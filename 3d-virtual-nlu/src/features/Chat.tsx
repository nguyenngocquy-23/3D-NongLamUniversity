import { useEffect, useState, useRef } from "react";
import styles from "../styles/chat.module.css";
// import { useUser } from "../Context.tsx";
import { IoIosClose, IoIosCloseCircle, IoMdSend } from "react-icons/io";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import { FaMessage, FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { AFTER_DOMAIN, API_URLS } from "../env";

const Chat = ({
  nodeId,
  setAccessing,
}: {
  nodeId: number;
  setAccessing: (value: any) => void;
}) => {
  // const { roomId, userId } = useParams(); // Lấy roomId & userId từ URL
  const user = useSelector((state: RootState) => state.auth.user);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [globalSocket, setGlobalSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<
    { avatar: string; username: string; content: string; createdAt: string }[]
  >([]);
  const [globalMessages, setGlobalMessages] = useState<
    { avatar: string; username: string; content: string; createdAt: string }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [page, setPage] = useState(0);
  const nodeMessagesRef = useRef<HTMLDivElement>(null);
  const globalMessagesRef = useRef<HTMLDivElement>(null);

  const [isOpenBox, setIsOpenBox] = useState(false);
  const [isFillInput, setIsFillInput] = useState(false);
  const [isSelectOption, setIsSelectOption] = useState(0);
  const navigate = useNavigate();

  // cờ để kiểm tra có load tin nhắn cũ không, nếu không thì sẽ nhận tin nhắn mới khi nhắn và scroll dưới cùng
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMessages([]);
    const wsUrl = `wss://${AFTER_DOMAIN}/chat/${nodeId}/${user?.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to node ${nodeId} as user ${user?.id}`);
      loadMessages(0);
    };

    ws.onmessage = (event) => {
      const data = event.data;
      if (data.startsWith("COUNT:")) {
        const count = data.split(":")[1];
        setAccessing(count);
      } else {
        const [avatar, username, content] = event.data.split(": ", 3);
        setMessages((prev) => [
          ...prev,
          { avatar, username, content, createdAt: new Date().toISOString() },
        ]);
      }
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

  useEffect(() => {
    if (!user) return;
    setGlobalMessages([]);
    const wsGlobal = new WebSocket(
      `wss://${AFTER_DOMAIN}/chat/global/${user.id}`
    );
    setGlobalSocket(wsGlobal);

    wsGlobal.onmessage = (event) => {
      const [avatar, username, content] = event.data.split(": ", 3);
      setGlobalMessages((prev) => [
        ...prev,
        { avatar, username, content, createdAt: new Date().toISOString() },
      ]);
    };

    wsGlobal.onclose = () => {
      console.log(`User ${user?.id} disconnected from node ${nodeId}`);
    };

    wsGlobal.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    setGlobalSocket(wsGlobal);

    return () => {
      wsGlobal.close();
    };
  }, [user?.id]);

  const scrollPositionRef = useRef<number>(0);

  const handleScroll = () => {
    const container = nodeMessagesRef.current;
    if (container && container.scrollTop === 0) {
      scrollPositionRef.current = container.scrollHeight;
      loadMessages(page + 1);
    }
  };

  const loadMessages = async (newPage: number) => {
    const container = nodeMessagesRef.current;
    if (!container) return;

    const prevScrollHeight = container.scrollHeight;
    setIsLoadingMore(true); // -> Đánh dấu là đang load thêm ở trên
    const response = await axios.get(
      `${API_URLS.BASE}/chat/messages?nodeId=${nodeId}&page=${newPage}&limit=6`
    );
    const data = response.data;

    setMessages((prev) => {
      return [...data.reverse(), ...prev]; // prepend
    });
    setPage(newPage);

    // Đợi render xong rồi giữ nguyên scroll
    setTimeout(() => {
      if (nodeMessagesRef.current) {
        const newScrollHeight = nodeMessagesRef.current.scrollHeight;
        const delta = newScrollHeight - prevScrollHeight;
        nodeMessagesRef.current.scrollTop += delta; // giữ nguyên vị trí tin nhắn cũ
      }
      setIsLoadingMore(false); // Đặt sau scroll để tránh scrollBottom từ useEffect
    }, 20);
  };

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      const targetSocket =
        isSelectOption === 0
          ? socket
          : isSelectOption === 1
          ? globalSocket
          : null;

      if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
        targetSocket.send(inputMessage);
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
    if (!nodeMessagesRef.current) return;

    // Nếu không phải đang load thêm (tức là tin nhắn mới gửi hoặc nhận)
    if (!isLoadingMore) {
      nodeMessagesRef.current.scrollTop = nodeMessagesRef.current.scrollHeight;
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
        {isSelectOption == 0 ? (
          <>
            <div
              className={styles.chatContent}
              onScroll={handleScroll}
              ref={isSelectOption === 0 ? nodeMessagesRef : globalMessagesRef}
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
                        <div
                          className={styles.avatar}
                          style={{
                            background: `url(${msg.avatar})`,
                          }}
                        >
                          {/* {msg.username.charAt(0)} */}
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
            {user ? (
              <>
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
              <button
                className={styles.login_button}
                onClick={() => navigate("/login")}
              >
                Đăng nhập để trò chuyện
              </button>
            )}
          </>
        ) : isSelectOption == 1 ? (
          <>
            <div
              className={styles.chatContent}
              onScroll={handleScroll}
              ref={isSelectOption === 1 ? nodeMessagesRef : globalMessagesRef}
            >
              {globalMessages.map((msg, index) => {
                const isMine = msg.username === user?.username;
                return (
                  <div
                    key={index}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {!isMine && (
                      <div className={styles.otherAccount}>
                        <div
                          className={styles.avatar}
                          style={{
                            background: `url(${msg.avatar})`,
                          }}
                        >
                          {/* {msg.username.charAt(0)} */}
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
            {user ? (
              <>
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
              <button
                className={styles.login_button}
                onClick={() => navigate("/login")}
              >
                Đăng nhập để trò chuyện
              </button>
            )}
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
