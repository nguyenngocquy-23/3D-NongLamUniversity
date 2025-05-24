import React, { useState } from "react";
import styles from "../../styles/createTour.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store.tsx";
import ProcessBar from "../../components/admin/ProcessBar.tsx";

const CreateTourStep4: React.FC = () => {
  const [activeStep, setActiveStep] = useState(3);

  return (
    <div className={styles.container}>
      <b style={{color:'black'}}>Tour đã được duyệt, kiểm tra tại trang chủ</b>
    </div>
  );
};

export default CreateTourStep4;
