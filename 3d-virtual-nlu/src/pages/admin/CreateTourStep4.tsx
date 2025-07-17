import React, { useState } from "react";
import styles from "../../styles/createTour.module.css";
import { useDispatch } from "react-redux";
import { resetStep } from "../../redux/slices/StepSlice.ts";

const CreateTourStep4: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <div className={styles.container}>
      <b style={{ color: "black" }}>
        Tour đã được duyệt, kiểm tra tại trang chủ
      </b>
      <br />
      <button
        onClick={() => {
          dispatch(resetStep());
        }}
        style={{padding: '0.5rem 1rem'}}
      >
        Tạo tour mới
      </button>
    </div>
  );
};

export default CreateTourStep4;
