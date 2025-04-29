import React, { useRef, useEffect, useState, useMemo, Component } from "react";
import styles from "../styles/createTour.module.css";
import BoardUploader from "../components/admin/BoardCreateTour.tsx";
import CreateTourStepper from "../components/admin/CreateTourStepper.tsx";
import CreateTourStep2 from "../pages/admin/CreateTourStep2.tsx";

const CreateNode: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectSpace, setSelectSpace] = useState("");
  const [listSpace, setListSpace] = useState<{ id: number; name: string }[]>(
    []
  );

  const handleSelectSpace = (spaceId: string) => {
    setSelectSpace(spaceId);
  };

  const handleSelectFiles = (files: File[]) => {
    setSelectedFiles(files);
  };

  /**
   * Sử dụng Stepper cho việc tạo tour.
   * > 1. Khởi tạo tour.
   * >> 1.1. Chọn lĩnh vực.
   * >> 1.2. Chọn không gian tạo tour.
   * >> 1.3. Upload ảnh 360 độ (tối đa 5 files.)
   * > 2. Thiết lập thông số.
   * >> 2.1. Thông tin không gian (Cho từng ảnh)
   * >> 2.2. Thông số kỹ thuật cho từng ảnh.
   * >> 2.3. Tạo điểm tương tác.
   * > 3. Xem trước và kiểm tra.
   * > 4. Lưu vào database.
   */

  const CREATE_TOUR_STEPS = [
    {
      name: "Khởi tạo",
      Component: () => (
        <BoardUploader
          onSelectSpace={handleSelectSpace}
          onSelectFiles={handleSelectFiles}
        />
      ),
    },
    {
      name: "Tuỳ chỉnh không gian",
      Component: () => <CreateTourStep2 />,
    },
    {
      name: "Thiết lập điểm tương tác",
      Component: () => <div>Abc xyz</div>,
    },
    {
      name: "Xem trước và xuất bản",
      Component: () => <div> Okela </div>,
    },
  ];

  return <CreateTourStepper stepsConfig={CREATE_TOUR_STEPS} />;
};

export default CreateNode;
