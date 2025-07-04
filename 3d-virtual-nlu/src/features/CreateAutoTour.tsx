import React, { useRef, useEffect, useState, useMemo, Component } from "react";
import CreateTourStepper from "../components/admin/CreateTourStepper.tsx";
import CreateTourStep2 from "../pages/admin/CreateTourStep2.tsx";
import CreateTourStep3 from "../pages/admin/CreateTourStep3.tsx";
import CreateTourStep4 from "../pages/admin/CreateTourStep4.tsx";
import { useDispatch } from "react-redux";
import { fetchHotspotTypes, fetchIcons } from "../redux/slices/DataSlice.ts";
import { AppDispatch } from "../redux/Store.ts";
import UploadFile from "../components/admin/UploadFile.tsx";
import CreateAutoTourStep2 from "../pages/admin/CreateAutoTourStep2.tsx";
import CreateAutoTourStep3 from "../pages/admin/CreateAutoTourStep3.tsx";

/**
 * Sử dụng Stepper cho việc tạo tour tự động.
 * > 1. Upload ảnh không gian.
 * > 2. Thiết lập thông số.
 * >> 2.1. Thông tin không gian (Cho từng ảnh)
 * >> 2.2. Thông số kỹ thuật cho từng ảnh.
 * >> 3. Xem trước và xuất bản.
 * >> 4. Trang chờ / thông báo
 */

export const CREATE_TOUR_STEPS = [
  {
    name: "Khởi tạo",
    Component: () => <UploadFile className={"upload_auto_panos"} />,
  },
  {
    name: "Tuỳ chỉnh không gian",
    Component: () => <CreateAutoTourStep2 />,
  },
  {
    name: "Xem trước và xuất bản",
    Component: () => <CreateAutoTourStep3 />,
  },
  {
    name: "Chờ duyệt từ quản trị viên",
    Component: () => <CreateTourStep4 />,
  },
];

const CreateAutoTour: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(()=>{
    dispatch(fetchIcons())
    dispatch(fetchHotspotTypes())
  },[dispatch])
  return <CreateTourStepper stepsConfig={CREATE_TOUR_STEPS} />;
};

export default CreateAutoTour;
