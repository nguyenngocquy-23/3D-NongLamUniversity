import React, { useEffect, useState } from "react";
import styles from "../../styles/createTour.module.css";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { useDispatch, useSelector } from "react-redux";
import { setSpaceId } from "../../redux/slices/PanoramaSlice.ts";
import { AppDispatch, RootState } from "../../redux/Store.ts";
import { fetchFields } from "../../redux/slices/DataSlice.ts";
import axios from "axios";
import { IoIosCloseCircle } from "react-icons/io";
import UploadFile from "./UploadFile.tsx";

interface DomeProps {
  panoramaURL: string;
}

const Dome: React.FC<DomeProps> = ({ panoramaURL }) => {
  const texture = useTexture(panoramaURL);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh>
      <sphereGeometry args={[100, 128, 128]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

const moveSpeed = 0.5;

const CameraControls = () => {
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          camera.position.z -= moveSpeed;
          break;
        case "ArrowDown":
          camera.position.z += moveSpeed;
          break;
        case "ArrowLeft":
          camera.position.x -= moveSpeed;
          break;
        case "ArrowRight":
          camera.position.x += moveSpeed;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera]);

  return null;
};

interface BoardUploadProps {
  onSelectSpace: (spaceId: string) => void;
  onSelectFiles: (files: File[]) => void;
}

const BoardUploader: React.FC<BoardUploadProps> = ({
  onSelectSpace,
  onSelectFiles,
}) => {
  const [panoramaURL, setPanoramaURL] = useState<string | null>(null);
  const [fullPreview, setFullPreview] = useState(false);
  const [listSpace, setListSpace] = useState<{ id: number; name: string }[]>(
    []
  );
  const dispatch = useDispatch<AppDispatch>();

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
    onSelectSpace(event.target.value);
    dispatch(setSpaceId(event.target.value));
  };

  // che do preview
  const handleFullPreview = () => {
    setFullPreview(!fullPreview);
  };

  // Xử lý khi thay đổi hình ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onSelectFiles(fileArray);
      // const previews = fileArray.map(file => URL.createObjectURL(file));
      // setPanoramaURLs(previews);
      setPanoramaURL(URL.createObjectURL(fileArray[0]));
    }
  };

  return (
    <section className={styles.upPanosSection}>
      <div className={styles.leftForm}>
        <div className={styles.item}>
          <label className={styles.label}>Lĩnh vực:</label>
          <select
            className={styles.custom_select}
            name="field"
            id="field"
            onChange={handleSelectField}
          >
            <option value="">-- Chọn lĩnh vực --</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.item}>
          <label className={styles.label}>Không gian:</label>
          <select
            className={styles.custom_select}
            name="space"
            id="space"
            onChange={handleSelectSpace}
          >
            <option value="">-- Chọn không gian --</option>
            {listSpace.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
        </div>
        {/* Form upload ảnh. */}
        <div className={styles.panosCard}>
          <UploadFile className={styles.uploadForm} />
        </div>
      </div>
      {fullPreview ? (
        <IoIosCloseCircle
          className={styles.close_btn}
          title="Quay lại"
          onClick={handleFullPreview}
        />
      ) : (
        ""
      )}
      {panoramaURL && (
        <div className={fullPreview ? styles.fullPreview : styles.panoPreview}>
          <Canvas
            camera={{ position: [0, 0, 0.01], fov: 75 }}
            style={{ width: "100%", height: "100%", borderRadius: fullPreview ? "0" : "10px"}}
          >
            <OrbitControls
              enableZoom={true}
              rotateSpeed={0.5}
              enablePan={false}
            />
            <CameraControls />
            <Dome panoramaURL={panoramaURL} />
          </Canvas>
          <button className={styles.preview_button} onClick={handleFullPreview}>
            Chế độ xem
          </button>
        </div>
      )}
    </section>
  );
};

export default BoardUploader;
