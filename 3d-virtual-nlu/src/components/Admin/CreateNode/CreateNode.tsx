import React, { Suspense, useRef, useState, useMemo } from "react";
import styles from "./createnode.module.css";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";

extend({ OrbitControls });

interface ControlsProps {
  enableZoom?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ enableZoom = true }) => {
  const { camera, gl } = useThree();
  const ref = useRef<OrbitControls | null>(null);

  useFrame(() => ref.current?.update());

  return (
    <primitive
      object={ref.current || new OrbitControls(camera, gl.domElement)}
      ref={ref}
      enableZoom={enableZoom}
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

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

const CreateNode: React.FC = () => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [panoramaURL, setPanoramaURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //* Xử lý khi thay đổi hình ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPanoramaURL(URL.createObjectURL(file));
    }
  };

  const handleUploadPanorama = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;
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
      }
      alert("Tải ảnh thành công" + imgUrl);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.upPanosSection}>
      <div className={styles.panosCard}>
        <form onSubmit={handleUploadPanorama} className={styles.panosForm}>
          <p>
            <label>Ảnh 360 độ: </label>
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              onChange={handleFileChange}
            />
          </p>
          <p>
            {isLoading ? (
              "Đang tải..."
            ) : (
              <button type="submit">Tải ảnh lên</button>
            )}
          </p>
        </form>

        {panoramaURL && (
          <div className={styles.panosPreview}>
            <Canvas camera={{ position: [0, 0, 0.1] }}>
              <Controls enableZoom />
              <Suspense fallback={<span>Đang tải...</span>}>
                <Dome panoramaURL={panoramaURL} />
              </Suspense>
            </Canvas>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreateNode;
