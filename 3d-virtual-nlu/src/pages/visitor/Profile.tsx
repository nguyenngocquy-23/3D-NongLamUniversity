import React, { useCallback, useState } from "react";
import styles from "../../styles/visitor/profile.module.css";
import { FaEyeSlash, FaEye, FaUpload } from "react-icons/fa6";
import UploadFile from "../../components/admin/UploadFile";
import Swal from "sweetalert2";
import axios from "axios";
import { fetchUser } from "../../redux/slices/AuthSlice";
import { AppDispatch } from "../../redux/Store";
import { useDispatch } from "react-redux";

const VisitorProfile = () => {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [avatar, setAvatar] = useState(user.avatar || "");

  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = (e: any) => {
    console.log("handle file change");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
        // Gửi lên server hoặc xử lý tiếp
        const response = await axios.post(
          "http://localhost:8080/api/user/updateAvatar",
          { userId: user.id, avatar: reader.result }
        );
        if (response.data.data) {
          Swal.fire({
            title: "Thành công",
            text: "Cập nhật ảnh đại diện thành công",
            icon: "success",
            position: "top-end",
            toast: true,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          dispatch(fetchUser(user.username));
        }
      } else {
        Swal.fire({
          title: "Thất bại",
          text: "Cập nhật ảnh đại diện thất bại",
          icon: "error",
          position: "top-end",
          toast: true,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    };
    reader.readAsDataURL(file); // đọc file thành base64
  };

  const handleChangeProfile = async () => {
    if (username.trim() == "" || email.trim() == "") {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin",
      });
      return;
    }
    if (username.trim() == user.username && email.trim() == user.email) {
      Swal.fire({
        icon: "info",
        title: "Không có gì thay đổi",
        text: "Vui lòng nhập thông tin mới",
      });
      return;
    }

    const response = await axios.post(
      "http://localhost:8080/api/user/updateProfile",
      {
        userId: user.id,
        username: username,
        email: email,
      }
    );
    if (response.data.data) {
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Cập nhật thông tin thành công",
      });
      dispatch(fetchUser(username))
    } else {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Tên tài khoản hoặc email đã tồn tại",
      });
    }
  };

  const handleChangePassword = async () => {
    if (password.trim() == "" || newPassword.trim() == "") {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }
    if (password.length < 6 || newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Mật khẩu có độ dài từ 6 ký tự",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }
    const passwordPatern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W]).+$/;
    if (!passwordPatern.test(newPassword)) {
      Swal.fire({
        icon: "error",
        title: "Mật khẩu chưa hợp lệ",
        text: "Chứa chữ in hoa, số và ký tự đặc biệt",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }
    if (password.trim() == newPassword.trim()) {
      Swal.fire({
        icon: "error",
        title: "Cảnh báo",
        text: "Mật khẩu đã tồn tại",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }
    if (confirmPassword.trim() != newPassword.trim()) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Xác nhận mật khẩu không chính xác",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    const response = await axios.post(
      "http://localhost:8080/api/user/updatePassword",
      {
        userId: user.id,
        password: password,
        newPassword: newPassword,
      }
    );
    if (response.data.data) {
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đổi mật khẩu thành công",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      Swal.fire({
        icon: "error",
        title: "Đổi mật khẩu thất bại.",
        text: "Kiểm tra lại mật khẩu",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <div
          className={styles.avatarImage}
          style={{
            background:`url(${avatar})`,
          }}
        />
        <div className={styles.uploadContainer}>
          <label className={styles.customFileInput}>
            Chọn ảnh
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
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
