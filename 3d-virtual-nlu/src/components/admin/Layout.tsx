import { useState, useEffect } from "react";
import { FaHome, FaSearch, FaUserCog } from "react-icons/fa";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaBookOpen,
  FaComment,
  FaMessage,
  FaUserPlus,
} from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import styles from "../../styles/layout.module.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/Store";
import { logoutUser } from "../../redux/slices/AuthSlice";
import { useLocation } from "react-router-dom"; // track url nam

const Layout = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("currentUser", currentUser);
    if (
      currentUser == undefined ||
      currentUser == null ||
      (currentUser && currentUser.roleId !== 2)
    ) {
      navigate("/unauthorized");
    }
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <nav className={styles.sidebar}>
        <Link to="/">
          <h2>Admin NLU 360</h2>
        </Link>
        <ul>
          <li className={styles.title}>Trang chủ</li>
          <Link to="/admin">
            <li className={location.pathname === "/admin" ? styles.click : ""}>
              <MdDashboard /> Dashboard
            </li>
          </Link>
          <li className={styles.title}>Quản lý</li>
          <Link to="/admin/fields">
            <li
              className={
                location.pathname === "/admin/fields"
                  ? styles.click
                  : ""
              }
            >
              Quản Lý Lĩnh vực
            </li>
          </Link>
          <Link to="/admin/spaces">
            <li
              className={
                location.pathname === "/admin/spaces"
                  ? styles.click
                  : ""
              }
            >
              Quản Lý Không gian
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
          <li className={styles.title}>Phản hồi</li>
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
                location.pathname === "/admin/commentManage" ? styles.click : ""
              }
            >
              <FaComment /> Quản Lý bình luận
            </li>
          </Link>
          <li className={styles.title}>Khác</li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className={styles.main_contain}>
        <header className={styles.header}>
          {/* <h2>Welcome to Admin</h2> */}
          <div className={styles.extension}>
            <input
              className={styles.input_search}
              type="text"
              placeholder="Search..."
            />
            <div className={styles.sub_extension}>
              <FaSearch />
            </div>
            <div className={styles.sub_extension}>
              <FaBell />
            </div>
            <div className={styles.sub_extension}>
              <FaMessage />
            </div>
          </div>
          {/* <Link to="/login">Đăng xuất</Link> */}
          <button onClick={handleLogout}>Đăng xuất</button>
        </header>
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Layout;
