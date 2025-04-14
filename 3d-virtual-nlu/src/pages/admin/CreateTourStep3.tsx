import React, { useEffect, useState } from "react";
import styles from "../../styles/createTour.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPanoramaUrl } from "../../redux/slices/PanoramaSlice.tsx";
import { AppDispatch, RootState } from "../../redux/Store.tsx";
import { fetchFields } from "../../redux/slices/DataSlice.tsx";
import Swal from "sweetalert2";
import ProcessBar from "../../components/admin/ProcessBar.tsx";
import { validateAndNavigate } from "../../features/PreValidate.tsx";

const CreateTourStep3: React.FC = () => {
  const [activeStep, setActiveStep] = useState(3)

  // Lấy danh sách fields từ Redux
  const fields = useSelector((state: RootState) => state.data.fields);

  // const isValid = validateAndNavigate(
  //   [
  //     { value: panoramaURL, name: panoramaURL },
  //   ],
  //   "/admin/createTour",
  //   "Vui lòng hoàn tất bước trước đó để tiếp tục!"
  // );

  // if (!isValid) {
  //   return;
  // }

  return (
    <div className={styles.container}>
      <ProcessBar activeStep={activeStep} />
      <b style={{ color: "black" }}>Quá trình phê duyệt đang diễn ra...</b>
    </div>
  );
};

export default CreateTourStep3;
