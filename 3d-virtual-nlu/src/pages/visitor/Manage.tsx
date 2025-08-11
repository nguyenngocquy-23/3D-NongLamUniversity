import styles from "../../styles/visitor/createTour.module.css";
import { Navigate, Outlet } from "react-router-dom";
import NavTour from "../../components/visitor/NavTour";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";

const VisitorManage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <NavTour setIsOpenNav={setIsOpen} />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default VisitorManage;
