import React, { useState } from "react";
import styles from "./admindashboard.module.css";
import { Link, Route, Routes } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { FaDiamondTurnRight } from "react-icons/fa6";
import Tours from "../Tours/Tours";

const AdminDashBoard: React.FC = () => {
  // Sử dụng cho sidebar.
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.adminContainer}>
      /** *Thanh sidebar bên trái màn hình. */
      <div
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <button
          className={styles.collapseBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <GoSidebarExpand />
        </button>

        <nav>
          <ul>
            <li>
              <Link to="/admin/areas">Quản lý khu vực</Link>
            </li>
            <li>
              <Link to="/admin/tours">Quản lý tour</Link>
            </li>
            <li>
              <Link to="/admin/users">Quản lý người dùng</Link>
            </li>
            <li>
              <Link to="/admin/comments">Quản lý bình luận</Link>
            </li>
          </ul>
        </nav>
      </div>
      /** Nội dung cho từng phần một. */
      <div className={styles.mainContent}>
        <header className={styles.adminHeader}>
          <img src="" alt="" className={styles.adminLogo} />
          <div className={styles.adminActions}>
            <button className={styles.backHome}>
              <FaDiamondTurnRight />
            </button>

            <div className={styles.adminAvatar}>
              <img src="" alt="avatar-admin-page" />
            </div>
          </div>
        </header>

        <div className={styles.contentAreas}>
          <Routes>
            <Route path="areas" element={<Tours />} />
            <Route path="areas" element={<Tours />} />
            <Route path="areas" element={<Tours />} />
            <Route path="areas" element={<Tours />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashBoard;
