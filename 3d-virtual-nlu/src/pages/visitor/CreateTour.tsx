import React, { useEffect } from "react";
import styles from "../../styles/visitor/manage.module.css";
import CreateNode from "../../features/CreateTour";
import { FaBook } from "react-icons/fa6";
import { resetStep } from "../../redux/slices/StepSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../redux/Store";

const VisitorCreateTour = () => {
  return (
    <div className={styles.container}>
      <CreateNode />
    </div>
  );
};

export default VisitorCreateTour;
