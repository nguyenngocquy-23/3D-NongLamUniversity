import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import { buildImageUrlWithQuality } from "../../../utils/getCloudinaryURL";
import styles from "../../../styles/previewModel.module.css";
import axios from "axios";
import { ApiResponse, CloudinaryUploadResp } from "../UploadFile";
import { API_URLS } from "../../../env";

type Props = {
  modelUrl: string;
  onThumbnailSaved: (url: string) => void; // callback về cho cha
};

const Model = ({ url }: { url: string }) => {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} dispose={null} />;
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
          color: "black",
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
    if (!snapshot) return alert("Vui lòng chụp ảnh trước!");
    setUploading(true);
    try {
      const url = await uploadToCloud(snapshot);
      alert("Đã tạo object URL: " + url);
      onThumbnailSaved(url); // Gửi URL ảnh về cho lớp cha
    } catch (err) {
      console.error("Lỗi khi upload thumbnail:", err);
      alert("Upload thất bại");
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
          <Model url={modelUrl} />
          <OrbitControls />
          <SnapshotHelper onSnapshotReady={setSnapshot} />
        </Canvas>
        {snapshot && (
          <div className={styles.snapshot_container}>
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
