import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { loginUser, loginWithGoogle } from "../../redux/slices/AuthSlice";
import { FaRegUser } from "react-icons/fa6";
import { CiLock } from "react-icons/ci";
import Swal from "sweetalert2";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

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

  useEffect(() => {
    if (password.length >= 6 || password.length == 0) {
      setPassLengthError(false);
    } else {
      setPassLengthError(true);
    }
  }, [password]);
  useEffect(() => {
    if (isError) {
      Swal.fire({
        icon: "error",
        title: "Tài khoản hoặc mật khẩu chưa đúng",
        text: "Vui lòng kiểm tra tài khoản và mật khẩu",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setIsError(false);
      return;
    }
  }, [isError]);

  // Xử lý khi form được submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Dispatch action đăng nhập
      const response = await dispatch(
        loginUser({ username, password })
      ).unwrap();
      if (response.user.roleId == 1) {
        navigate("/"); // Điều hướng về trang chính sau khi đăng nhập thành công
      } else if (response.user.roleId == 2 || response.user.roleId == 3) {
        navigate("/admin"); // Điều hướng về trang admin sau khi đăng nhập thành công
      }
    } catch (err: any) {
      console.error(err);
      setIsError(true);
    }
  };

  const handleShowContent = () => {
    setShowContent((preState) => !preState);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className={styles.container}>
        <div className={styles.loginContainer}>
          <h2 className={styles.h2}>Đăng nhập</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <FaRegUser className={styles.icon} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Tên tài khoản"
                className={`${styles.inputField} ${
                  isError ? styles.passLengthError : ""
                }`}
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
                placeholder="Mật khẩu"
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
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                console.log("Google token", credentialResponse.credential);
                if (credentialResponse.credential) {
                  const decoded = jwtDecode(credentialResponse.credential);
                  console.log("Google decoded user", decoded);

                  try {
                    const response = await dispatch(
                      loginWithGoogle(credentialResponse.credential)
                    ).unwrap();

                    if (response.user.roleId === 1) {
                      navigate("/");
                      // } else if ([2, 3].includes(response.user.roleId)) {
                      //   navigate("/admin");
                    }
                  } catch (error) {
                    console.error("Google login failed", error);
                    Swal.fire({
                      icon: "error",
                      title: "Đăng nhập Google thất bại",
                      toast: true,
                      timer: 2000,
                      position: "top-end",
                      showConfirmButton: false,
                      timerProgressBar: true,
                    });
                  }
                }
              }}
              onError={() => {
                console.log("Google login error");
              }}
            />
            {/* {isError && <p className={styles.error}>{error}</p>}
          {passLengthError && (
            <p className={styles.error}> Mật khẩu phải có ít nhất 6 ký tự</p>
          )} */}
            {/* <button className={styles.loginBtn} type="submit">Login</button> */}
          </form>
          <Link className={styles.link} to="/forgotPassword">
            Quên mật khẩu?
          </Link>{" "}
          <br />
          <b>
            Chưa có tài khoản?{" "}
            <Link className={styles.link} to="/register">
              Đăng ký tại đây!
            </Link>
          </b>
        </div>
        {/* <canvas className={styles.canvas_login}></canvas> */}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
