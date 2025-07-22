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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { logoutUser } from "../../redux/slices/AuthSlice";

type SideBarProps = {
  isOpenSidebar: boolean;
  currentUser: any;
  setTitle: (title: string) => void;
};

const Sidebar: React.FC<SideBarProps> = ({
  isOpenSidebar,
  currentUser,
  setTitle,
}) => {
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

  const note_contact = useSelector((state: RootState) => state.data.contacts); 
  const note_contact_not_feedback = note_contact.filter(
    (contact) => contact.status == 0
  ).length;

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
            <img
              src={`${import.meta.env.BASE_URL}avatar.jpg`}
              alt="avatar-admin"
            />
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
        <Link to="/admin" onClick={() => setTitle("Tổng quan")}>
          <li
            className={`
            ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname.endsWith("/admin") ? styles.click : ""}
            `}
          >
            <MdDashboard />
            {isOpen && <span>Tổng quan</span>}
          </li>
        </Link>

        <Link to="/admin/icons" onClick={() => setTitle("Biểu tượng")}>
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname.includes("/admin/icons") ? styles.click : ""}
            
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
            <Link to="/admin/fields" onClick={() => setTitle("Lĩnh vực")}>
              <li
                className={
                  location.pathname.includes("/admin/fields")
                    ? styles.click
                    : ""
                }
              >
                <span>Lĩnh vực</span>
              </li>
            </Link>
            <Link to="/admin/spaces" onClick={() => setTitle("Không gian")}>
              <li
                className={
                  location.pathname.includes("/admin/spaces")
                    ? styles.click
                    : ""
                }
              >
                <span>Không gian</span>
              </li>
            </Link>
            <Link to="/admin/tours" onClick={() => setTitle("Quản lý tour")}>
              <li
                className={
                  location.pathname.includes("ours") ||
                  location.pathname.includes("Tour")
                    ? styles.click
                    : ""
                }
              >
                Tour
              </li>
            </Link>
          </ul>
        )}

        <Link to="/admin/users" onClick={() => setTitle("Tài khoản")}>
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${location.pathname.includes("/admin/users") ? styles.click : ""}
            `}
          >
            <FaUserCog />
            {isOpen && <span>Tài khoản</span>}
          </li>
        </Link>

        <Link to="/admin/attachMap" onClick={() => setTitle("Gán nhãn bản đồ")}>
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${
              location.pathname.includes("/admin/attachMap") ? styles.click : ""
            }
            `}
          >
            <FaMap />
            {isOpen && <span>Gán nhãn bản đồ</span>}
          </li>
        </Link>
        {currentUser.roleId === 2 && (
          <Link
            to="/admin/createAccount"
            onClick={() => setTitle("Thêm quản trị viên")}
          >
            <li
              className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${
              location.pathname.includes("/admin/createAccount")
                ? styles.click
                : ""
            }
            `}
            >
              <FaUserPlus />
              {isOpen && <span>Thêm quản trị viên</span>}
            </li>
          </Link>
        )}
        <Link to="/admin/contacts" onClick={() => setTitle("Phản hồi")}>
          <li
            className={`
              ${isOpen ? styles.expand_nav_item : styles.collapse_nav_item}
            ${
              location.pathname.includes("/contacts")
                ? styles.click
                : ""
            }
            `}
          >
            <FaComment />
            {isOpen && <span>Phản hồi</span>}
            {note_contact_not_feedback > 0 && (
              <span className={styles.notification}>
                {note_contact_not_feedback}
              </span>
            )}
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
