// src/components/LoginForm.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useUser } from "../Context.tsx";

const Login: React.FC = () => {
  // Khai báo state để lưu trữ giá trị của username và password
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  const { setUser } = useUser();

  // Xử lý sự kiện khi form được submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn chặn việc reload trang

    // Kiểm tra xem username có phải là email hợp lệ không
    // const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    // if (!emailPattern.test(username)) {
    //   alert("Please enter a valid email address.");
    //   return;
    // }

    // Kiểm tra xem password có ít nhất 6 ký tự không
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/login",
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Kiểm tra nếu đăng nhập thành công
      if (response.data.statusCode !== 1000) {
        console.log("Invalid");
        throw new Error(
          response.data.message || "Invalid username or password"
        );
      }

      const responseUser = await axios.post(
        "http://localhost:8080/api/user",
        { username: username, password: password, },
        {
          headers: {
            Authorization: response.data.data.token,
            "Content-Type": "application/json",
          },
        }
      );

      // Kiểm tra nếu đăng nhập thành công
      if (responseUser.data == null) {
        console.log("Get userInfo failed");
        throw new Error("Get userInfo failed");
      }

      // Lấy thông tin người dùng từ response
      const userData = responseUser.data;

      // Lưu thông tin người dùng vào context
      setUser(userData);

      // Lưu token vào localStorage để sử dụng sau này
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.data.data.token);

      // Chuyển hướng sau khi đăng nhập thành công
      navigate("/");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleShowContent = () => {
    setShowContent((preState) => !preState);
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
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
            <FontAwesomeIcon
              className={styles.eye}
              onClick={handleShowContent}
              icon={showContent ? faEyeSlash : faEye}
            ></FontAwesomeIcon>
          </div>
          <button className={styles.loginBtn} type="submit">Login</button>
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
