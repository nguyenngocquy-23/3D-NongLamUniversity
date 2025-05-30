import React, { useState } from "react";
import styles from "../../styles/createTour.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store.tsx";
import ProcessBar from "../../components/admin/ProcessBar.tsx";
import { resetStep } from "../../redux/slices/StepSlice.ts";

const CreateTourStep4: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <div className={styles.container}>
      <b style={{color:'black'}}>Tour đã được duyệt, kiểm tra tại trang chủ</b><br />
      <button onClick={() => {dispatch(resetStep())}}>Tạo tour mới</button>
    </div>
  );
};

export default CreateTourStep4;
