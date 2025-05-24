// src/components/LoginForm.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { loginUser } from "../../redux/slices/AuthSlice";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { FaUserAlt } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { scheduleTokenRefresh } from "../../utils/ScheduleRefreshToken";

const Login: React.FC = () => {
  // Khai báo state để lưu trữ giá trị của username và password
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [isError, setIsError] = useState(false);
  const [passLengthError, setPassLengthError] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  // Xử lý khi form được submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // if (password.length < 6) {
    //   setPassLengthError(true);
    //   setIsError(false);
    //   return;
    // }else{
    //   setPassLengthError(false);
    // }

    try {
      // Dispatch action đăng nhập
      const response = await dispatch(
        loginUser({ username, password })
      ).unwrap();
      if (response.user.roleId == 1) {
        navigate("/"); // Điều hướng về trang chính sau khi đăng nhập thành công
      } else if (response.user.roleId == 2) {
        navigate("/admin"); // Điều hướng về trang admin sau khi đăng nhập thành công
      }
    } catch (err:any) {
        console.error(err);
        setIsError(true);
    }
  };
  

  const handleShowContent = () => {
    setShowContent((preState) => !preState);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <h2 className={styles.h2}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <FaRegUser className={styles.icon}/>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className={`${styles.inputField} ${
                isError ? styles.passLengthError : ""
              }`}
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
              className={`${styles.inputField} ${
                passLengthError ? styles.passLengthError : ""
              } ${isError ? styles.passLengthError : ""} `}
            />
            <FontAwesomeIcon
              className={styles.eye}
              onClick={handleShowContent}
              icon={showContent ? faEyeSlash : faEye}
            ></FontAwesomeIcon>
          </div>
          <button
            className={styles.loginBtn}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {isError && <p className={styles.error}>{error}</p>}
          {passLengthError && (
            <p className={styles.error}> Mật khẩu phải có ít nhất 6 ký tự</p>
          )}
          {/* <button className={styles.loginBtn} type="submit">Login</button> */}
        </form>
        <Link className={styles.link} to="/forgotPassword">
          Forgot Password
        </Link>{" "}
        <br />
        <b>
          Don't have an account?{" "}
          <Link className={styles.link} to="/register">
            Register here!
          </Link>
        </b>
      </div>
      {/* <canvas className={styles.canvas_login}></canvas> */}
    </div>
  );
};

export default Login;
