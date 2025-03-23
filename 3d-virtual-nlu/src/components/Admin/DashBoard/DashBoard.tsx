import React, { useState } from "react";
import styles from "./dashboard.module.css";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaCamera, FaChartBar } from "react-icons/fa6";
import Navigation from "../Navigation/Navigation";

const DashBoard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard"); //Mặc định sẽ là tạo tour mới.

  return (
    <div className={styles.dashboardContainer}>
      <Navigation />
    </div>
  );
};

export default DashBoard;
