// src/components/LoginForm.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from './Login.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Login: React.FC = () => {
  // Khai báo state để lưu trữ giá trị của username và password
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  // Xử lý sự kiện khi form được submit
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn chặn việc reload trang

    // Kiểm tra xem username có phải là email hợp lệ không
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(username)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Kiểm tra xem password có ít nhất 6 ký tự không
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Kiểm tra thông tin đăng nhập (ví dụ đơn giản)
    if (username === "admin@gmail.com" && password === "123456") {
      navigate("/tour");
    } else {
      alert("Invalid username or password");
    }
  };

  const handleShowContent = () =>{
    setShowContent((preState) => !preState);
  }

  return (
    <div className={styles.container} style={{position:'relative'}}>
      <div className={styles.loginContainer}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type={showContent ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className={styles.inputField}
            />
            <FontAwesomeIcon className={styles.eye} onClick={handleShowContent} icon={ showContent ? faEyeSlash : faEye}></FontAwesomeIcon>
          </div>
          <button type="submit">Login</button>
        </form>
        <Link to="/forgotPassword">Forgot Password</Link> <br />
        <b>
          Don't have an account? <Link to="/register">Register here!</Link>
        </b>
      </div>
      {/* <canvas className={styles.canvas_login}></canvas> */}
    </div>
  );
};

export default Login;
