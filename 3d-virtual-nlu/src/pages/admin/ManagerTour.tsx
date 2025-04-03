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
  const [isToggle, setIsToggle] = useState(false);

  const toggleFeature = () => {
    setIsToggle((preState) => !preState);
  };

  return (
    <div className={styles.container}>
      {/* <div className={styles.title} onClick={toggleFeature}>
        <b>Tính năng</b>
        {isToggle ? (
          <FaAngleUp className={styles.iconDown} />
        ) : (
          <FaAngleDown className={styles.iconDown} />
        )}
      </div> */}
      <div className={styles.features}>
        <Link to="/admin/createTour" className={styles.feature}>
          <FaPlus className={styles.iconFeature} />
          <h2>Tạo tour mới</h2>
        </Link>
        <Link to="/admin/updateTour" className={styles.feature}>
          <FaUpload className={styles.iconFeature} />
          <h2>Cập nhật tour mới</h2>
        </Link>
      </div>
    </div>
  );
};

export default ManagerTour;
