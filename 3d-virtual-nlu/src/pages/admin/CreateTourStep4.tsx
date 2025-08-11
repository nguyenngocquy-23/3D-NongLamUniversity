import React, { useState } from "react";
import styles from "../../styles/createTourStep4.module.css";
import { useDispatch } from "react-redux";
import { resetStep } from "../../redux/slices/StepSlice.ts";
import { FaCheckCircle } from "react-icons/fa";
import { CiCircleCheck } from "react-icons/ci";

const CreateTourStep4: React.FC = () => {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const dispatch = useDispatch();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <CiCircleCheck className={styles.icon}/> <br />
      <b style={{ color: "black", margin: 'auto' }}>
        {user.roleId == 1
          ? "Tour đã được tạo thành công, vui lòng đợi phê duyệt"
          : "Tour đã được tạo thành công, kiểm tra tại trang quản lý tour"}
      </b>
      <br />
      <button
        onClick={() => {
          dispatch(resetStep());
        }}
        style={{ padding: "0.5rem 1rem" }}
      >
        Tạo tour mới
      </button>
      </div>
    </div>
  );
};

export default CreateTourStep4;
