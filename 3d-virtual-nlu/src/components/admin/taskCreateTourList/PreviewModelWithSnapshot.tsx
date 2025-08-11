import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import { buildImageUrlWithQuality } from "../../../utils/getCloudinaryURL";
import styles from "../../../styles/previewModel.module.css";
import axios from "axios";
import { ApiResponse, CloudinaryUploadResp } from "../UploadFile";
import { API_URLS } from "../../../env";
import Swal from "sweetalert2";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

type Props = {
  modelUrl: string;
  onThumbnailSaved: (url: string) => void; // callback về cho cha
};

const SafeModel = ({
  url,
  setError,
}: {
  url: string;
  setError: (error: boolean) => void;
}) => {
  const [gltf, setGltf] = useState<any>(null);
  const [isError, setIsError] = useState<string | null>(null);

  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    const step = 0.1;

    const handleKeyDown = (e: KeyboardEvent) => {
      setPosition((prev) => {
        const [x, y, z] = prev;
        switch (e.key) {
          case "ArrowUp":
            return [x, y + step, z];
          case "ArrowDown":
            return [x, y - step, z];
          case "ArrowLeft":
            return [x - step, y, z];
          case "ArrowRight":
            return [x + step, y, z];
          default:
            return prev;
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!url) return;
    const loader = new GLTFLoader();

    loader.load(
      url,
      (data) => setGltf(data),
      undefined,
      (err) => {
        setIsError("Mô hình lỗi. Không thể tải mô hình.");
        setError(true);
      }
    );
  }, [url]);

  if (isError)
    return (
      <Html>
        <div
          style={{
            color: "red",
            width: "200px",
            textAlign: "center",
            transform: "translateX(-50%)",
          }}
        >
          {isError}
        </div>
      </Html>
    );
  if (!gltf) return <Html>Đang tải mô hình...</Html>;

  return (
    <primitive
      object={gltf.scene}
      position={position}
      scale={[0.5, 0.5, 0.5]}
    />
  );
};

const SnapshotHelper = ({
  onSnapshotReady,
}: {
  onSnapshotReady: (img: string) => void;
}) => {
  const { gl, scene, camera } = useThree();
  const taken = useRef(false);

  const takeSnapshot = () => {
    gl.render(scene, camera);
    const imgData = gl.domElement.toDataURL("image/png");
    onSnapshotReady(imgData);
  };

  return (
    <Html>
      <button
        onClick={takeSnapshot}
        style={{
          position: "absolute",
          whiteSpace: "nowrap",
          top: 100,
          right: 0,
          color: "white",
          padding: "0.5rem 1rem",
          zIndex: 1,
        }}
      >
        📸 Chụp Thumbnail
      </button>
    </Html>
  );
};

const ModelPreviewWithSnapshot = ({ modelUrl, onThumbnailSaved }: Props) => {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [error, setError] = useState(false);

  const uploadToCloud = async (snapshot: string) => {
    const formData = new FormData();
    formData.append("file", snapshot);
    const response = await axios.post<ApiResponse<CloudinaryUploadResp>>(
      API_URLS.UPLOAD_CLOUD,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data.data.url || "";
  };

  const handleUploadThumbnail = async () => {
    if (!snapshot) {
      Swal.fire({
        title: "Chưa có ảnh thumbnail",
        text: "Vui lòng chụp ảnh thumbnail trước khi lưu.",
        icon: "warning",
        showCancelButton: false,
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        position: "top-end",
      });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToCloud(snapshot);
      onThumbnailSaved(url);
      setIsSave(true);
    } catch (err) {
      console.error("Lỗi khi upload thumbnail:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className={styles.model_preview_container}>
        <Canvas
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [2, 2, 2], fov: 50 }}
          className={styles.canvas}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 3, 3]} />
          <SafeModel url={modelUrl} setError={setError} />
          <OrbitControls />
          <SnapshotHelper onSnapshotReady={setSnapshot} />
        </Canvas>
        {snapshot && (
          <div
            className={styles.snapshot_container}
            style={{
              backgroundColor: isSave
                ? "rgba(0, 255, 0, 0.5)"
                : "rgba(0,0,0,0.5)",
            }}
          >
            <h5 className={styles.title}>📷 Ảnh Thumbnail:</h5>
            <img
              src={snapshot}
              alt="snapshot"
              style={{ width: 150, margin: "10px 0" }}
            />
            <button
              onClick={handleUploadThumbnail}
              disabled={uploading}
              className={styles.upload_button}
            >
              {uploading ? "Đang tải..." : "Lưu Thumbnail"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelPreviewWithSnapshot;
