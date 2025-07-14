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
  fetchContacts,
  fetchDashboard,
  fetchFields,
  fetchHotspotTypes,
  fetchIcons,
  fetchNodes,
  fetchSpaces,
} from "../../redux/slices/DataSlice";
import { scheduleTokenRefresh } from "../../utils/ScheduleRefreshToken";
import Sidebar from "./Sidebar";
import { perPage } from "../../utils/Constants";

const Layout = () => {
  const currentUserJson = sessionStorage.getItem("user");
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState("Tổng quan");

  useEffect(() => {
    if (
      currentUser == undefined ||
      currentUser == null ||
      (currentUser && currentUser.roleId !== 2 && currentUser.roleId !== 3)
    ) {
      navigate("/unauthorized");
      return;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchFields({ limit: perPage, page: 0}));
    dispatch(fetchSpaces({ limit: perPage, page: 0 }));
    dispatch(fetchHotspotTypes());
    dispatch(fetchNodes());
    dispatch(fetchIcons());
    dispatch(fetchContacts());
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
  const [isOpenSideBar, setIsOpenSideBar] = useState(false);

  useEffect(() => {
    if (
      currentStep === 2 ||
      currentStep === 3 ||
      location.pathname == "/admin/model"
    ) {
      setIsOptionFullScreen(true);
    } else {
      setIsOptionFullScreen(false);
    }
  }, [currentStep]);
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      {!isOptionFullScreen && currentUser && (
        <Sidebar
          isOpenSidebar={isOpenSideBar}
          currentUser={currentUser}
          setTitle={setTitle}
        />
      )}
      {/* Main Content */}
      <main className={styles.main_contain}>
        {!isOptionFullScreen && (
          <header className={styles.header}>
            <h2>{title}</h2>
          </header>
        )}
        <section
          className={styles.content}
          style={{
            borderRadius: isOptionFullScreen ? "0" : "10px",
          }}
        >
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Layout;
