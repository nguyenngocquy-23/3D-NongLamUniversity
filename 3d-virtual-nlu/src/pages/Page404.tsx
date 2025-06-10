import { Link, Navigate, useNavigate } from "react-router-dom";
import styles from "../styles/pageNotFound.module.css";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>404</h1>
      <h2 className={styles.message}>Trang không tồn tại</h2>
      <p className={styles.description}>
        Có vẻ như bạn đã nhập sai địa chỉ hoặc trang này không còn tồn tại.
      </p>
      <button
        onClick={() => {
          // navigate("/login");
          navigate(-1);
        }}
        className={styles.homeButton}
      >
        Quay lại
      </button>
    </div>
  );
};

export default PageNotFound;
