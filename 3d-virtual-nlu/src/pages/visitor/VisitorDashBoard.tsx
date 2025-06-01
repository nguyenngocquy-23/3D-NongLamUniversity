import React from "react";
import styles from "../../styles/visitor/dashboard.module.css";
import { FaChartColumn } from "react-icons/fa6";

const VisitorDashBoard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.category}>
        <FaChartColumn />
        <span className={styles.title}>Số tour</span>
        <span>2</span>
      </div>
      <div className={styles.category}>
        <FaChartColumn />
        <span className={styles.title}>Số lượt xem</span>
        <span>2.000</span>
      </div>
      <div className={styles.category}>
        <FaChartColumn />
        <span className={styles.title}>Số bình luận</span>
        <span>20</span>
      </div>
      <div className={styles.category}>
        <FaChartColumn />
        <span className={styles.title}>Số lượt chia sẻ</span>
        <span>20</span>
      </div>
      <div className={styles.category}>
        <FaChartColumn />
        <span className={styles.title}>Đang được phê duyệt</span>
        <span>1</span>
      </div>
    </div>
  );
};

export default VisitorDashBoard;
