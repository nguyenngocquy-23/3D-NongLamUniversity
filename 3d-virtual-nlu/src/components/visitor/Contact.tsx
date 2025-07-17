import React, { useState } from "react";
import styles from "../../styles/visitor/contact.module.css";
import Swal from "sweetalert2";
import axios from "axios";
import { API_URLS } from "../../env";

export default function Contact() {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const [email, setEmail] = useState(user?.email || "");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !content) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng điền đầy đủ thông tin!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
    if (content.length < 10) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Nội dung liên hệ phải có ít nhất 10 ký tự!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    try {
      const response = await axios.post(API_URLS.SEND_CONTACT, {
        userId: user?.id || null,
        email: email,
        content: content,
      });
      if (response.data.data) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Liên hệ của bạn đã được gửi thành công!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        setContent("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Đã xảy ra lỗi khi gửi liên hệ. Vui lòng thử lại sau.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Đã xảy ra lỗi khi gửi liên hệ. Vui lòng thử lại sau.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      console.error("Error sending contact:", error);
    }
  };

  return (
    <div id="contact" className={styles.contactContainer}>
      <h2 className={styles.title}>Liên hệ với chúng tôi</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          id="email"
          value={email}
          className={styles.input}
          placeholder="Email liên hệ"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          id="content"
          value={content}
          className={styles.textarea}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập nội dung liên hệ..."
          required
        />
        <button type="submit" className={styles.button}>
          Gửi
        </button>
      </form>
    </div>
  );
}
