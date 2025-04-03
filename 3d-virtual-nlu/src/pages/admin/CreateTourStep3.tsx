import React, { useRef, useEffect, useState, useMemo } from "react";
import styles from "../../styles/createTour.module.css";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPanoramaUrl } from "../../redux/slices/PanoramaSlice.tsx";
import { AppDispatch, RootState } from "../../redux/Store.tsx";
import { fetchFields } from "../../redux/slices/DataSlice.tsx";
import Swal from "sweetalert2";
import ProcessBar from "../../components/admin/ProcessBar.tsx";
import BoardUploader from "../../components/admin/BoardCreateTour.tsx";
import { validateAndNavigate } from "../../features/PreValidate.tsx";

const CreateTourStep3: React.FC = () => {
  const [activeStep, setActiveStep] = useState(3);
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const panoramaURL = useSelector(
    (state: RootState) => state.panorama.panoramaUrl
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectSpace, setSelectSpace] = useState("");
  const [listSpace, setListSpace] = useState<{ id: number; name: string }[]>(
    []
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy danh sách fields từ Redux
  const fields = useSelector((state: RootState) => state.data.fields);

  const isValid = validateAndNavigate(
    [
      { value: panoramaURL, name: panoramaURL },
    ],
    "/admin/createTour",
    "Vui lòng hoàn tất bước trước đó để tiếp tục!"
  );

  if (!isValid) {
    return;
  }

  useEffect(() => {
    dispatch(fetchFields()); // Gọi API khi component được render
  }, [dispatch]);

  // lay name space
  const handleSelectSpace = (spaceId: string) => {
    setSelectSpace(spaceId);
  };

  // lay url
  const handleSelectFile = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadPanorama = async () => {
    if (selectSpace == "" || selectSpace == null) {
      Swal.fire("Loi", "Vui long chon khong gian", "error");
      return;
    }
    if (!selectedFile) {
      Swal.fire("Loi", "Vui long nhap anh khong gian", "error");
      return;
    }
    setIsLoading(true);

    try {
      let imgUrl;

      if (
        selectedFile?.type === "image/png" ||
        selectedFile?.type === "image/jpg" ||
        selectedFile?.type === "image/jpeg"
      ) {
        const image = new FormData();
        image.append("file", selectedFile);
        image.append("cloud_name", CLOUD_NAME);
        image.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
          {
            method: "post",
            body: image,
          }
        );
        const imgData = await response.json();

        imgUrl = imgData.url.toString();
        setPanoramaURL(imgUrl.secure_url);
        console.log("Before dispatch:", imgUrl);
        dispatch(setPanoramaUrl(imgUrl));
        navigate(`${location.pathname}/2`);
      }
      alert("Tải ảnh thành công" + imgUrl);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <ProcessBar activeStep={activeStep} />
      <b style={{ color: "black" }}>Quá trình phê duyệt đang diễn ra...</b>
    </div>
  );
};

export default CreateTourStep3;
