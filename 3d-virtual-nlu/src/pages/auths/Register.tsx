// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FaRegUser } from "react-icons/fa6";
import { CiLock } from "react-icons/ci";
import { MdOutlineVerified } from "react-icons/md";

const Register: React.FC = () => {
  // Khai báo state để lưu trữ giá trị của username, password và confirmPassword
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showContent, setShowContent] = useState(false);

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

    // Kiểm tra xem password và confirmPassword có khớp không
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Nếu tất cả hợp lệ, thông báo đăng ký thành công
    alert("Registration successful!");
  };
  const handleShowContent = () => {
    setShowContent((preState) => !preState);
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <div className={styles.loginContainer}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <FaRegUser className={styles.icon}/>
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
          <div className={styles.inputGroup}>
            <CiLock className={styles.icon}/>
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
              style={{ right: "15px" }}
              onClick={handleShowContent}
              icon={showContent ? faEyeSlash : faEye}
            ></FontAwesomeIcon>
          </div>
          <div className={styles.inputGroup}>
            <MdOutlineVerified className={styles.icon}/>
            <input
              type={showContent ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              className={styles.inputField}
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <Link to="/login">Already have an account? Login here!</Link>
      </div>
    </div>
  );
};

export default Register;
