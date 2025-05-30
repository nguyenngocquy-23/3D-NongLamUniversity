import { useState, useEffect, createContext, useContext } from "react";
import { FaHome, FaSearch, FaUserCog } from "react-icons/fa";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaBell, FaMessage } from "react-icons/fa6";
import styles from "../../styles/layout.module.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { logoutUser } from "../../redux/slices/AuthSlice";
import { useLocation } from "react-router-dom"; // track url nam
import {
  fetchFields,
  fetchHotspotTypes,
  fetchIcons,
  fetchNodes,
  fetchSpaces,
} from "../../redux/slices/DataSlice";
import { scheduleTokenRefresh } from "../../utils/ScheduleRefreshToken";
import Sidebar from "./Sidebar";

const Layout = () => {
  const currentUserJson = sessionStorage.getItem("user");
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("currentUser:", currentUser);
    if (
      currentUser == undefined ||
      currentUser == null
      // (currentUser && currentUser.roleId !== 2)
    ) {
      console.log("navigate");
      navigate("/unauthorized");
      return;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchFields());
    dispatch(fetchSpaces());
    dispatch(fetchHotspotTypes());
    dispatch(fetchNodes());
    dispatch(fetchIcons());
  }, [dispatch]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      scheduleTokenRefresh(token, dispatch);
    }
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  const [isOptionFullScreen, setIsOptionFullScreen] = useState(true);

  useEffect(() => {
    if (currentStep === 2 || currentStep === 3) {
      setIsOptionFullScreen(false);
    } else {
      setIsOptionFullScreen(true);
    }
  }, [currentStep]);
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      {isOptionFullScreen && currentUser && (
        <Sidebar isOpenSidebar={true} currentUser={currentUser} />
      )}
      {/* Main Content */}
      <main className={styles.main_contain}>
        {isOptionFullScreen && (
          <header className={styles.header}>
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
            <button onClick={handleLogout}>Đăng xuất</button>
          </header>
        )}
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Layout;
