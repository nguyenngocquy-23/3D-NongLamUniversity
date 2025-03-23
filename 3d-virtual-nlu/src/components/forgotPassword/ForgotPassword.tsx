// src/components/LoginForm.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../login/Login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeDropper,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const ForgotPassword: React.FC = () => {
  // Khai báo state để lưu trữ giá trị của username và password
  const [username, setUsername] = useState<string>("");

  // Xử lý sự kiện khi form được submit
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn chặn việc reload trang

    // Kiểm tra xem username có phải là email hợp lệ không
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(username)) {
      alert("Please enter a valid email address.");
      return;
    }
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <div className={styles.loginContainer}>
        <h2> </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your email"
              className={styles.inputField}
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
