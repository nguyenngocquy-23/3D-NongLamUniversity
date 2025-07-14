import React, { useState } from "react";
import styles from "../../styles/feedbackBox.module.css";
import { FaX } from "react-icons/fa6";
import axios from "axios";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import { fetchContacts } from "../../redux/slices/DataSlice";
import Swal from "sweetalert2";
import { API_URLS } from "../../env";

const FeedbackBox = ({
  contactId,
  email,
  setOpenFeedback,
  currentContent,
}: {
  contactId: number;
  email: string;
  setOpenFeedback: React.Dispatch<React.SetStateAction<boolean>>;
  currentContent: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleFeedback = async (contactId: number, email: string) => {
    try {
      const response = await axios.post(API_URLS.ADMIN_FEEDBACK_CONTACT, {
        contactId: contactId,
        email: email,
        content: feedback,
      });
      if (response.data.data) {
        Swal.fire({
          title: "Phản hồi thành công!",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
          toast: true,
          timerProgressBar: true,
          position: "top-end",
        });
        setOpenFeedback(false);
      } else {
        Swal.fire({
          title: "Lỗi phản hồi!",
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
          toast: true,
          timerProgressBar: true,
          position: "top-end",
        });
      }
      dispatch(fetchContacts()); // Cập nhật lại danh sách người dùng sau khi thay đổi trạng thái
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg =
          typeof err.response?.data === "string"
            ? err.response.data
            : "Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại sau";
        setError(errorMsg);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpenFeedback(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.header}>
          <button className={styles.close_btn} onClick={handleClose}>
            <FaX />
          </button>
        </div>
        <div className={styles.container_content}>
          {/* Nội dung liên hệ hiện tại */}
          <div className={styles.contact_content}>
            <label htmlFor="replyTextarea" className={styles.reply_label}>
              Nội dung liên hệ: 
            </label> <br />
             {currentContent}
          </div>
          <hr />
          {/* Phản hồi */}
          <div className={styles.reply_section}>
            <label htmlFor="replyTextarea" className={styles.reply_label}>
              Phản hồi:
            </label>
            <textarea
              id="replyTextarea"
              className={styles.reply_textarea}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhập phản hồi tại đây..."
              rows={5}
            />

            <button
              className={styles.reply_button}
              onClick={() => handleFeedback(contactId, email)}
              disabled={feedback.length < 10}
            >
              Gửi phản hồi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackBox;
