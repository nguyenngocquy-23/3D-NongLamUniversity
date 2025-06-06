import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/sidebar.module.css";
import {
  MdDashboard,
  MdInsertEmoticon,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { FaHome, FaUserCog } from "react-icons/fa";
import { FaBookOpen, FaComment, FaUserPlus } from "react-icons/fa6";
import { GoSidebarExpand } from "react-icons/go";
import { IoSettings } from "react-icons/io5";
import { BiSolidCommentDetail } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";
import { TbTournament } from "react-icons/tb";

type SideBarProps = {
  isOpenSidebar: boolean;
  currentUser: any;
};

const Sidebar: React.FC<SideBarProps> = ({ isOpenSidebar, currentUser }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSideBar = () => {
    setIsOpen((prev) => !prev);
  };

  const [showSubMenu, setShowSubMenu] = useState(false);
  return (
    <nav
      className={styles.side_bar}
      style={{
        maxWidth: isOpen ? "20%" : undefined,
      }}
    >
      <div className={styles.side_bar_admin}>
        {isOpen && (
          <>
            <img src="/public/avatar.jpg" alt="avatar-admin" />
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
        <Link to="/admin">
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname === "/admin" ? styles.click : ""}
            
            `}
          >
            <MdDashboard />
            {isOpen && <span>Tổng quan</span>}
          </li>
        </Link>

        {isOpen && (
          <>
            <Link to="/admin/icons">
              <li
                className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname === "/admin/icons" ? styles.click : ""}
            
            `}
              >
                <MdInsertEmoticon />
                {isOpen && <span>Biểu tượng</span>}
              </li>
            </Link>

            <li
              className={` ${styles.visit}`}
              onClick={() => setShowSubMenu((prev) => !prev)}
            >
              <TbTournament />
              {isOpen && <span>Tham quan</span>}
              <MdKeyboardArrowDown className={styles.open_sub_visit} />
            </li>

            {showSubMenu && (
              <ul className={styles.sub_menu}>
                <Link to="/admin/fields">
                  <li
                    className={
                      location.pathname === "/admin/fields" ? styles.click : ""
                    }
                  >
                    <span>Lĩnh vực</span>
                  </li>
                </Link>
                <Link to="/admin/spaces">
                  <li
                    className={
                      location.pathname === "/admin/spaces" ? styles.click : ""
                    }
                  >
                    <span>Không gian</span>
                  </li>
                </Link>
                <Link to="/admin/tours">
                  <li
                    className={
                      location.pathname.includes("our") ? styles.click : ""
                    }
                  >
                    Quản lý tour
                  </li>
                </Link>
              </ul>
            )}

            <Link to="/admin/users">
              <li
                className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname === "/admin/users" ? styles.click : ""}
            
            `}
              >
                <FaUserCog /> Tài khoản
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
                <FaComment /> Bình luận
              </li>
            </Link>
          </>
        )}
        <li className={styles.title}>
          <BiSolidCommentDetail />
          {isOpen && <span>Khác</span>}
        </li>
      </ul>
      <div className={styles.side_bar_logout}>
        <CiLogout />
        {isOpen && <span>Đăng xuất</span>}
      </div>
    </nav>
  );
};

export default Sidebar;
