import React, { useState } from "react";
import styles from "../../styles/visitor/profile.module.css";
import { FaEyeSlash, FaEye, FaUpload } from "react-icons/fa6";
import UploadFile from "../../components/admin/UploadFile";

const VisitorProfile = () => {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChangeProfile = () => {};
  const handleChangePassword = () => {};
  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <div className={styles.avatarImage} />
        <div style={{width:'100%',margin:'auto'}}>
          <UploadFile />
        </div>
      </div>
      <div className={styles.profile}>
        <div className={styles.account_info}>
          <h2 className={styles.title}>Thông tin tài khoản</h2>
          <input
            type="text"
            placeholder="Tên tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className={styles.button} onClick={handleChangeProfile}>
            Lưu thông tin
          </button>
        </div>
        <div className={styles.change_password}>
          <h2 className={styles.title}>Đổi mật khẩu</h2>
          <div className={styles.passwordContainer}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.showPassword}
              onClick={() => setShowPass((pre) => !pre)}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className={styles.button} onClick={handleChangePassword}>
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorProfile;
