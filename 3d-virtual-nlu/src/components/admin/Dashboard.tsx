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
import styles from "../../styles/dashboard.module.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/Store";
import { logoutUser } from "../../redux/slices/AuthSlice";

const Dashboard = () => {
  //   const currentUser = useUser();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [clickDashBoard, setClickDashBoard] = useState(true);
  const [clickBlog, setClickBlog] = useState(false);
  const [clickContact, setClickContact] = useState(false);
  const [clickUsers, setClickUsers] = useState(false);
  const [clickCategory, setClickCategory] = useState(false);
  const [clickComment, setClickComment] = useState(false);
  const [clickCreateAdmin, setClickCreateAdmin] = useState(false);

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("authToken");
  };

  const navigate = useNavigate();
  //   const dispatch = useDispatch();
  useEffect(() => {
    console.log("currentUser", currentUser);
    if (
      currentUser == undefined ||
      currentUser == null ||
      (currentUser && currentUser.roleId !== 2)
    ) {
      navigate("/unauthorized");
    }
  }, [currentUser, navigate]);

  const handlerDashboard = () => {
    setClickDashBoard(true);
    setClickContact(false);
    setClickBlog(false);
    setClickUsers(false);
    setClickCategory(false);
    setClickComment(false);
    setClickCreateAdmin(false);
  };
  const handlerBlog = () => {
    setClickDashBoard(false);
    setClickContact(false);
    setClickBlog(true);
    setClickUsers(false);
    setClickCategory(false);
    setClickComment(false);
    setClickCreateAdmin(false);
  };
  const handlerContact = () => {
    setClickDashBoard(false);
    setClickContact(true);
    setClickBlog(false);
    setClickUsers(false);
    setClickCategory(false);
    setClickComment(false);
    setClickCreateAdmin(false);
  };
  const handlerUsers = () => {
    setClickDashBoard(false);
    setClickContact(false);
    setClickBlog(false);
    setClickUsers(true);
    setClickCategory(false);
    setClickComment(false);
    setClickCreateAdmin(false);
  };
  const handlerCategory = () => {
    setClickDashBoard(false);
    setClickContact(false);
    setClickBlog(false);
    setClickUsers(false);
    setClickCategory(true);
    setClickComment(false);
    setClickCreateAdmin(false);
  };
  const handlerComment = () => {
    setClickDashBoard(false);
    setClickContact(false);
    setClickBlog(false);
    setClickUsers(false);
    setClickCategory(false);
    setClickComment(true);
    setClickCreateAdmin(false);
  };
  const createAdmin = () => {
    setClickDashBoard(false);
    setClickContact(false);
    setClickBlog(false);
    setClickUsers(false);
    setClickCategory(false);
    setClickComment(false);
    setClickCreateAdmin(true);
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
          <li className={`${clickDashBoard ? styles.click : ""}`}>
            <Link to="/admin">
              <MdDashboard /> Dashboard
            </Link>
          </li>
          <li className={styles.title}>Quản lý</li>
          <li className={`${clickBlog ? styles.click : ""}`}>
            <Link to="/admin/blogs">Quản Lý Bài Viết</Link>
          </li>
          <li className={`${clickContact ? styles.click : ""}`}>
            <Link to="/admin/ContactManager">Quản Lý Liên Hệ</Link>
          </li>
          <li className={`${clickUsers ? styles.click : ""}`}>
            <Link to="/admin/users">
              <FaUserCog /> Quản Lý Tài Khoản
            </Link>
          </li>
          <li className={styles.title}>Phản hồi</li>
          <li className={`${clickCategory ? styles.click : ""}`}>
            <Link to="/admin/category">
              <FaBookOpen /> Quản Lý danh mục
            </Link>
          </li>
          <li className={`${clickCreateAdmin ? styles.click : ""}`}>
            <Link to="/admin/adminCreate">
              <FaUserPlus /> Thêm quản trị viên
            </Link>
          </li>
          <li className={`${clickComment ? styles.click : ""}`}>
            <Link to="/admin/commentManage">
              <FaComment /> Quản Lý bình luận
            </Link>
          </li>
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
          <Link to="/login">Đăng xuất</Link>
        </header>
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
