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


const Dashboard = () => {
  return (
    <div className={styles.container}>
        <p>Hello Dashboard</p>
    </div>
  );
};

export default Dashboard;
