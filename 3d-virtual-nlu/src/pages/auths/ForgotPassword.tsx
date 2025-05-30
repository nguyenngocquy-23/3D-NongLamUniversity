// src/components/LoginForm.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeDropper,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FaRegUser } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import { forgotPassword } from "../../redux/slices/AuthSlice";

const ForgotPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // Khai báo state để lưu trữ giá trị của username và password
  const [email, setEmail] = useState<string>("");

  // Xử lý sự kiện khi form được submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn chặn việc reload trang

    // Kiểm tra xem username có phải là email hợp lệ không
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Email chưa hợp lệ",
        text: "Email chưa hợp lệ",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    try {
      // Giả lập gọi API xác thực
      const response = await dispatch(
        forgotPassword({ email: email })
      ).unwrap();
      if (response === true) {
        Swal.fire({
          icon: "success",
          title: "Đổi mật khẩu thành công",
          text: "Vui lòng kiểm tra email để nhận mật khẩu mới.",
        });
        setEmail("");
        navigate("/login");
      } else {
        throw new Error("Email không tồn tại trong hệ thống");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Email không hợp lệ",
        text: "Email không tồn tại trong hệ thống.",
      });
    }
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <div className={styles.loginContainer}>
        <h2 className={styles.h2}>Enter your email</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <FaRegUser className={styles.icon} />
            <input
              type="text"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className={styles.inputField}
            />
          </div>
          <button type="submit" className={styles.loginBtn}>
            Gửi
          </button>
        </form>
        <p>
          Remembered password?
          <Link className={styles.link} to="/login">
            Login here!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
