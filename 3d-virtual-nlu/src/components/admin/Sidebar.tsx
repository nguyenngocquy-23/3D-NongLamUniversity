import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/sidebar.module.css";
import { MdDashboard } from "react-icons/md";
import { FaHome, FaUserCog } from "react-icons/fa";
import { FaBookOpen, FaComment, FaUserPlus } from "react-icons/fa6";
import { GoSidebarExpand } from "react-icons/go";
import { IoSettings } from "react-icons/io5";
import { BiSolidCommentDetail } from "react-icons/bi";

type SideBarProps = {
  isOpenSidebar: boolean;
  currentUser: any;
};

const Sidebar: React.FC<SideBarProps> = ({ isOpenSidebar, currentUser }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSideBar = () => {
    setIsOpen((prev) => !prev);
  };
  return (
    <nav
      className={styles.side_bar}
      style={{
        width: isOpen ? "20%" : undefined,
      }}
    >
      <div className={styles.side_bar_admin}>
        {isOpen && (
          <>
            <img src="/public/avatar.jpg" alt="" />
            <div className={styles.admin_info}>
              <Link to="/">
                <h5>Chào bạn, {currentUser.username} !</h5>
              </Link>
            </div>
          </>
        )}
      </div>
      <span className={styles.side_bar_toggle} onClick={toggleSideBar}>
        <GoSidebarExpand />
      </span>

      <ul
        style={{
          marginTop: isOpen ? undefined : "30px",
        }}
      >
        <li className={styles.title}>
          <FaHome />
          {isOpen && <span>Trang chủ</span>}
        </li>
        {isOpen && (
          <Link to="/admin">
            <li className={location.pathname === "/admin" ? styles.click : ""}>
              <MdDashboard />
              <span>Dashboard</span>
            </li>
          </Link>
        )}

        <li className={styles.title}>
          <IoSettings />
          {isOpen && <span>Quản lý</span>}
        </li>

        {isOpen && (
          <>
            <Link to="/admin/icons">
              <li
                className={
                  location.pathname === "/admin/icons" ? styles.click : ""
                }
              >
                {isOpen && <span>Quản Lý Biểu tượng</span>}
              </li>
            </Link>
            <Link to="/admin/fields">
              <li
                className={
                  location.pathname === "/admin/fields" ? styles.click : ""
                }
              >
                {isOpen && <span>Quản Lý Lĩnh vực</span>}
              </li>
            </Link>
            <Link to="/admin/spaces">
              <li
                className={
                  location.pathname === "/admin/spaces" ? styles.click : ""
                }
              >
                {isOpen && <span> Quản Lý Không gian</span>}
              </li>
            </Link>
            <Link to="/admin/tours">
              <li
                className={
                  location.pathname.includes("our") ? styles.click : ""
                }
              >
                Quản Lý Tour
              </li>
            </Link>

            <Link to="/admin/users">
              <li
                className={
                  location.pathname === "/admin/users" ? styles.click : ""
                }
              >
                <FaUserCog /> Quản Lý Tài Khoản
              </li>
            </Link>
          </>
        )}
        <li className={styles.title}>
          <BiSolidCommentDetail />
          {isOpen && <span>Phản hồi</span>}
        </li>
        {isOpen && (
          <>
            <Link to="/admin/category">
              <li
                className={
                  location.pathname === "/admin/category" ? styles.click : ""
                }
              >
                <FaBookOpen /> Quản Lý danh mục
              </li>
            </Link>
            <Link to="/admin/adminCreate">
              <li
                className={
                  location.pathname === "/admin/adminCreate" ? styles.click : ""
                }
              >
                <FaUserPlus /> Thêm quản trị viên
              </li>
            </Link>
            <Link to="/admin/commentManage">
              <li
                className={
                  location.pathname === "/admin/commentManage"
                    ? styles.click
                    : ""
                }
              >
                <FaComment /> Quản Lý bình luận
              </li>
            </Link>
          </>
        )}
        <li className={styles.title}>
          <BiSolidCommentDetail />
          {isOpen && <span>Khác</span>}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
