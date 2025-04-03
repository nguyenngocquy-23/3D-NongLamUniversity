import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import styles from "../styles/createTour.module.css";
import { Canvas, events, extend, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaAngleLeft, FaBackward } from "react-icons/fa6";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPanoramaUrl, setSpaceId } from "../redux/slices/PanoramaSlice.tsx";
import { AppDispatch, RootState } from "../redux/Store.tsx";
import { fetchFields } from "../redux/slices/DataSlice.tsx";
import axios from "axios";
import Swal from "sweetalert2";

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

const UpdateNode: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [panoramaURL, setPanoramaURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectSpace, setSelectSoace] = useState("");
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

  // Lấy danh sách space theo field
  const handleSelectField = async (event: any) => {
    const fieldId = event?.target.value;

    if (!fieldId) {
      setListSpace([]); // Nếu chọn "-- Chọn lĩnh vực --", reset danh sách spaces
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/admin/space/byField",
        { fieldId: fieldId }
      );
      const listSpace = response.data.data;
      console.log("listSpace", listSpace);
      setListSpace(listSpace);
    } catch {
      console.log("call api choose field error");
    }
  };

  // Chon space
  const handleSelectSpace = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectSoace(event.target.value);
    dispatch(setSpaceId(event.target.value));
  };

  //* Xử lý khi thay đổi hình ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPanoramaURL(URL.createObjectURL(file));
    }
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
      <div className={styles.navigateBar}>
        <FaAngleLeft />
      </div>
      <div className={styles.listTour}>
        
      <div className={styles.title}>
        <b>Danh sách tour</b>
      </div>
      <div className={styles.tours} style={{color:"black"}}>
        <ul>
          <li>stt/ id</li>
          <li> ten linh vuc</li>
          <li>ten khong gian</li>
          <li>ten node</li>
          <li>mo ta</li>
          <li>trang thai</li>
          <li>thoi gian cap nhat</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default UpdateNode;
