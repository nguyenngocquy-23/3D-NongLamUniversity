import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "../../styles/login.module.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import { verifyUser } from "../../redux/slices/AuthSlice";

const Verify = () => {
  const userIdStr = sessionStorage.getItem("userId");
  const userId = userIdStr ? parseInt(userIdStr) : 0;
  console.log(userId);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Đếm ngược thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newCode = [...code];
      newCode[index] = val;
      setCode(newCode);
      if (val && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = code.join("");

    if (!/^\d{6}$/.test(finalCode)) {
      Swal.fire({
        icon: "error",
        title: "Mã không hợp lệ",
        text: "Vui lòng nhập chính xác 6 chữ số.",
      });
      return;
    }

    try {
      // Giả lập gọi API xác thực
      const response = await dispatch(
        verifyUser({ userId: userId, token: code.join("") })
      ).unwrap(); // thay bằng real dispatch nếu cần
      if (response === true) {
        Swal.fire({
          icon: "success",
          title: "Xác thực thành công",
        }).then(() => {
          sessionStorage.removeItem("userId")
          navigate("/login");
        });
      } else {
        throw new Error("Mã không hợp lệ");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Xác thực thất bại",
        text: "Mã không đúng hoặc đã hết hạn.",
      });
    }
  };

  const handleResend = () => {
    Swal.fire({
      icon: "info",
      title: "Đã gửi lại mã",
      text: "Vui lòng kiểm tra email.",
    });
    setTimeLeft(300);
    setCode(Array(6).fill(""));
    inputRefs.current[0]?.focus();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <h2 className={styles.h2}>Nhập mã xác thực</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.codeInputContainer}>
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => {
                  inputRefs.current[index] = el!;
                }}
                className={styles.codeInput}
              />
            ))}
          </div>
          <button type="submit" className={styles.loginBtn}>
            Xác thực
          </button>
        </form>
        <p>Còn lại: {formatTime(timeLeft)}</p>
        <button
          className={styles.loginBtn}
          type="button"
          onClick={handleResend}
          disabled={timeLeft > 0}
        >
          Gửi lại mã
        </button>
      </div>
    </div>
  );
};

export default Verify;
