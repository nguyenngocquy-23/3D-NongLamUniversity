import React, { useRef, useEffect, useState, useMemo, Component } from "react";
import styles from "../styles/createTour.module.css";
import BoardUploader from "../components/admin/BoardCreateTour.tsx";
import CreateTourStepper from "../components/admin/CreateTourStepper.tsx";
import CreateTourStep2 from "../pages/admin/CreateTourStep2.tsx";
import CreateTourStep3 from "../pages/admin/CreateTourStep3.tsx";
import CreateTourStep4 from "../pages/admin/CreateTourStep4.tsx";
import { useDispatch } from "react-redux";
import { fetchHotspotTypes, fetchIcons } from "../redux/slices/DataSlice.ts";
import { AppDispatch } from "../redux/Store.ts";

/**
 * Sử dụng Stepper cho việc tạo tour.
 * > 1. Khởi tạo tour.
 * >> 1.1. Chọn lĩnh vực.
 * >> 1.2. Chọn không gian tạo tour.
 * >> 1.3. Upload ảnh 360 độ (tối đa 5 files.)
 * > 2. Thiết lập thông số.
 * >> 2.1. Thông tin không gian (Cho từng ảnh)
 * >> 2.2. Thông số kỹ thuật cho từng ảnh.
 * > 3. Thiết lập điểm tương tác
 * >> 3.1. Thêm điểm di chuyển.
 * >> 3.2. Thêm điểm thông tin.
 * >> 3.3. Thêm mô hình.
 * > 4. Xem trước và xuất bản.
 */

export const CREATE_TOUR_STEPS = [
  {
    name: "Khởi tạo",
    Component: () => <BoardUploader />,
  },
  {
    name: "Tuỳ chỉnh không gian",
    Component: () => <CreateTourStep2 />,
  },
  {
    name: "Xem trước và xuất bản",
    Component: () => <CreateTourStep3 />,
  },
  {
    name: "Chờ duyệt từ quản trị viên",
    Component: () => <CreateTourStep4 />,
  },
];

const CreateNode: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(()=>{
    dispatch(fetchIcons())
    dispatch(fetchHotspotTypes())
  },[dispatch])
  return <CreateTourStepper stepsConfig={CREATE_TOUR_STEPS} />;
};

export default CreateNode;
