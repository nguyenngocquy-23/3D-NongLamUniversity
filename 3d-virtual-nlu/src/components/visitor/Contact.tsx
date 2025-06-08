import React, { useState } from "react";
import styles from "../../styles/visitor/contact.module.css";

export default function Contact() {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const [email, setEmail] = useState(user?.email || "");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic gửi form ở đây
    alert("Đã gửi liên hệ!");
    setContent("");
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
        <button type="submit" className={styles.button}>Gửi</button>
      </form>
    </div>
  );
}
