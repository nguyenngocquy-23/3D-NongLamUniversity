import styles from "../../styles/visitor/createTour.module.css";
import { Navigate, Outlet } from "react-router-dom";
import NavTour from "../../components/visitor/NavTour";
import { useEffect, useState } from "react";

const VisitorManage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className={styles.container}>
      <NavTour setIsOpenNav={setIsOpen} />
      {/* <CreateNode/> */}
      <div
        style={{ height: isOpen ? "88%" : "95%", transition: "all .5s ease" }}
      >
        <Outlet /> {/* Nội dung page */}
      </div>
    </div>
  );
};

export default VisitorManage;
