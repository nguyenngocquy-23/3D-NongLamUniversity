import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUpload,
  FaPlus,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa6";
import styles from "../../styles/managerTour.module.css";
import { color } from "framer-motion";

const ManagerTour = () => {

  return (
    <div className={styles.container}>
      <div className={styles.features}>
        <Link to="/admin/createTour" className={styles.feature}>
          <FaPlus className={styles.iconFeature} />
          <h2>Tạo tour mới</h2>
        </Link>
        <Link to="/admin/manageTour" className={styles.feature}>
          <FaUpload className={styles.iconFeature} />
          <h2>Cập nhật tour mới</h2>
        </Link>
      </div>
    </div>
  );
};

export default ManagerTour;
