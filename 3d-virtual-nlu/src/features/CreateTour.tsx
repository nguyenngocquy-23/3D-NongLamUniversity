import React, { useRef, useEffect, useState, useMemo } from "react";
import styles from "../styles/createTour.module.css";
import * as THREE from "three";
import { FaAngleLeft } from "react-icons/fa6";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPanoramaUrl, setSpaceId } from "../redux/slices/PanoramaSlice.tsx";
import { AppDispatch, RootState } from "../redux/Store.tsx";
import { fetchFields } from "../redux/slices/DataSlice.tsx";
import Swal from "sweetalert2";
import ProcessBar from "../components/admin/ProcessBar.tsx";
import BoardUploader from "../components/admin/BoardCreateTour.tsx";

interface ControlsProps {
  enableZoom?: boolean;
}

const Controls: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      autoRotate={true}
      autoRotateSpeed={0.5}
    />
  );
};

interface DomeProps {
  panoramaURL: string;
}

const Dome: React.FC<DomeProps> = ({ panoramaURL }) => {
  const texture = useMemo(
    () => new THREE.TextureLoader().load(panoramaURL),
    [panoramaURL]
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh>
      <sphereGeometry args={[100, 128, 128]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

const CreateNode: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [panoramaURLs, setPanoramaURLs] = useState<string[]>([]);

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

  useEffect(() => {
    dispatch(fetchFields()); // Gọi API khi component được render
  }, [dispatch]);

  const handleSelectSpace = (spaceId: string) => {
    setSelectSpace(spaceId);
  };

  //
  const handleSelectFiles = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUploadPanorama = async () => {
    if (selectSpace == "" || selectSpace == null) {
      Swal.fire("Lỗi", "Vui lòng chọn không gian", "error");
      return;
    }
    if (!selectedFiles) {
      Swal.fire("Lỗi", "Vui lòng nhập ảnh không gian", "error");
      return;
    }
    setIsLoading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        if (["image/png", "image/jpg", "image/jpeg"].includes(file.type)) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("cloud_name", CLOUD_NAME);
          formData.append("upload_preset", UPLOAD_PRESET);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
            { method: "POST", body: formData }
          );
          const imgData = await response.json();
          return { file, url: imgData.secure_url };
        } else {
          return { file, url: null };
        }
      });

      const uploadedResults = await Promise.all(uploadPromises);
      const validResults = uploadedResults.filter(
        (result) => result.url !== null
      );

      validResults.forEach(({ url }) => {
        dispatch(addPanoramaUrl(url!)); // đẩy từng URL vào Redux
      });

      setPanoramaURLs(validResults.map((result) => result.url!));
      alert(`Đã tải ${validResults.length} ảnh thành công!`);
      navigate(`${location.pathname}/2`);
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi", "Đã xảy ra lỗi khi tải ảnh!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigateBar}>
        <FaAngleLeft />
        <button onClick={handleUploadPanorama}>Tiếp tục</button>
      </div>
      <ProcessBar activeStep={activeStep} />
      <BoardUploader
        onSelectSpace={handleSelectSpace}
        onSelectFiles={handleSelectFiles}
      />
    </div>
  );
};

export default CreateNode;
