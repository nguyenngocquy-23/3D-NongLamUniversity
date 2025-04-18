import React, { useState } from "react";
import styles from "../styles/createTour.module.css";
import stylesBar from "../styles/common/navigateBar.module.css";
import { FaAngleLeft } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPanoramaUrl } from "../redux/slices/PanoramaSlice.tsx";
import { AppDispatch } from "../redux/Store.tsx";
import Swal from "sweetalert2";
import ProcessBar from "../components/admin/ProcessBar.tsx";
import BoardUploader from "../components/admin/BoardCreateTour.tsx";

const CreateNode: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [panoramaURL, setPanoramaURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectSpace, setSelectSpace] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // lay name space
  const handleSelectSpace = (spaceId : string) => {
    setSelectSpace(spaceId);
  };

  // lay url 
  const handleSelectFile = (file : File) => {
    setSelectedFile(file);
  };

  const handleUploadPanorama = async () => {
    if (selectSpace=="" || selectSpace == null){
      Swal.fire(
        "Loi",
        "Vui long chon khong gian",
        "error"
      )
      return;
    }
    if (!selectedFile){
      Swal.fire(
        "Loi",
        "Vui long nhap anh khong gian",
        "error"
      )
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
      <div className={stylesBar.navigateBar}>
        <FaAngleLeft />
        <button onClick={handleUploadPanorama}>Tiếp tục</button>
      </div>
      <ProcessBar activeStep={activeStep} />
      <BoardUploader onSelectSpace={handleSelectSpace} onSelectFile={handleSelectFile}/>
    </div>
  );
};

export default CreateNode;
