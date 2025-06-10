import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/sidebar.module.css";
import {
  MdDashboard,
  MdInsertEmoticon,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdNotifications,
} from "react-icons/md";
import { FaHome, FaUserCog } from "react-icons/fa";
import { FaBookOpen, FaComment, FaMap, FaUserPlus } from "react-icons/fa6";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { IoSettings } from "react-icons/io5";
import { BiSolidCommentDetail } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";
import { TbTournament } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import { logoutUser } from "../../redux/slices/AuthSlice";

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

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

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
        {isOpen ? <GoSidebarExpand /> : <GoSidebarCollapse />}
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
          className={` ${isOpen ? styles.visit : styles.collapse_nav_item} ${
            styles.expand_nav_item
          }
          ${showSubMenu && styles.active_nav_item}
          
          `}
          onClick={() => {
            setShowSubMenu((prev) => !prev);
            setIsOpen(true);
          }}
        >
          <TbTournament />
          {isOpen && <span>Tham quan</span>}
          {showSubMenu ? (
            <MdKeyboardArrowUp className={styles.open_sub_visit} />
          ) : (
            <MdKeyboardArrowDown className={styles.open_sub_visit} />
          )}
        </li>

        {isOpen && showSubMenu && (
          <ul
            className={`${styles.sub_menu} 
          ${showSubMenu && styles.active_nav_item_ul}
          `}
          >
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
        
        <li
          className={` ${isOpen ? styles.visit : styles.collapse_nav_item} ${
            styles.expand_nav_item
          }
          ${showSubMenu && styles.active_nav_item}
          
          `}
          onClick={() => {
            setShowSubMenu((prev) => !prev);
            setIsOpen(true);
          }}
        >
          <MdNotifications />
          {isOpen && <span>Phê duyệt</span>}
          {showSubMenu ? (
            <MdKeyboardArrowUp className={styles.open_sub_visit} />
          ) : (
            <MdKeyboardArrowDown className={styles.open_sub_visit} />
          )}
        </li>

        {isOpen && showSubMenu && (
          <ul
            className={`${styles.sub_menu} 
          ${showSubMenu && styles.active_nav_item_ul}
          `}
          >
            <Link to="/admin/fields">
              <li
                className={
                  location.pathname === "/admin/fields" ? styles.click : ""
                }
              >
                <span>Tour</span>
              </li>
            </Link>
            <Link to="/admin/spaces">
              <li
                className={
                  location.pathname === "/admin/spaces" ? styles.click : ""
                }
              >
                <span>Báo cáo</span>
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
            <FaUserCog />
            {isOpen && <span>Tài khoản</span>}
          </li>
        </Link>

        <Link to="/admin/attachMap">
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname === "/admin/attachMap" ? styles.click : ""}
            
            `}
          >
            <FaMap />
            {isOpen && <span>Gán nhãn bản đồ</span>}
          </li>
        </Link>
        <Link to="/admin/adminCreate">
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname === "/admin/adminCreate" ? styles.click : ""}
            
            `}
          >
            <FaUserPlus />
            {isOpen && <span>Thêm quản trị viên</span>}
          </li>
        </Link>
        <Link to="/admin/commentManage">
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname === "/admin/commentManage" ? styles.click : ""}
            
            `}
          >
            <FaComment />
            {isOpen && <span>Bình luận</span>}
          </li>
        </Link>
      </ul>
      <div className={styles.side_bar_logout} onClick={handleLogout}>
        <CiLogout />
        {isOpen && <span>Đăng xuất</span>}
      </div>
    </nav>
  );
};

export default Sidebar;
