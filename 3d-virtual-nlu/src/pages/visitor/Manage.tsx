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
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="nav"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.nav}
          >
            <NavTour setIsOpenNav={setIsOpen} />
          </motion.div>
        )}
      </AnimatePresence>

      <span className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaCaretUp /> : <FaCaretDown />}
      </span>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default VisitorManage;
