// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FaBox, FaLetterboxd, FaRegUser } from "react-icons/fa6";
import { CiLock, CiMail } from "react-icons/ci";
import { MdOutlineVerified } from "react-icons/md";
import { FaMailBulk } from "react-icons/fa";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { registerUser } from "../../redux/slices/AuthSlice";

const Register: React.FC = () => {
  // Khai báo state để lưu trữ giá trị của username, password và confirmPassword
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showContent, setShowContent] = useState(false);
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Xử lý sự kiện khi form được submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn chặn việc reload trang

    if (username.length < 3) {
      Swal.fire({
        icon: "error",
        title: "Tên tài khoản chưa hợp lệ",
        text: "Tên tài khoản phải dài hơn 3 ký tự",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

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

    if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Mật khẩu chưa hợp lệ",
        text: "Độ dài trên 8 ký tự",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    // Kiểm tra xem password có ít nhất 6 ký tự không
    const passwordPatern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W]).+$/;
    if (!passwordPatern.test(password)) {
      Swal.fire({
        icon: "error",
        title: "Mật khẩu chưa hợp lệ",
        text: "Chưa chữ in hoa, số và ký tự đặc biệt",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    // Kiểm tra xem password và confirmPassword có khớp không
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Mật khẩu chưa khớp",
        text: "Vui lòng xác nhận lại mật khẩu",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    try {
      // Dispatch action đăng nhập
      const response = await dispatch(
        registerUser({ username, email, password })
      ).unwrap();
      if (response) {
        setUsername("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        navigate("/verify");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Đăng ký thật bại",
        text: "Tên tài khoản hoặc email đã được đăng ký",
        toast: true,
        timer: 4000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };
  const handleShowContent = () => {
    setShowContent((preState) => !preState);
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <div className={styles.loginContainer}>
        <h2 className={styles.h2}>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <FaRegUser className={styles.icon} />
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
            <CiMail className={styles.icon} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputGroup}>
            <CiLock className={styles.icon} />
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
            <MdOutlineVerified className={styles.icon} />
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
          <button
            className={styles.loginBtn}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Register"}
          </button>
        </form>
        <p>
          Already have an account?
          <Link className={styles.link} to="/login">
            Login here!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
