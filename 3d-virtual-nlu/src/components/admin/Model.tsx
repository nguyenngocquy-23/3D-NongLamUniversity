import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import styles from "../../styles/model.module.css";
import {
  FaAngleLeft,
  FaInbox,
  FaQuestion,
  FaShareFromSquare,
} from "react-icons/fa6";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaCloudDownloadAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { API_URLS } from "../../env";

interface NodeProps {
  modelUrl: string;
}

const Node: React.FC<NodeProps> = ({ modelUrl }) => {
  const modelRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [rotate, setRotate] = useState(true);

  // const texture = useTexture("/floor.png");

  useEffect(() => {
    const loader = new GLTFLoader();
    console.error("Load GLB:");
    loader.load(
      modelUrl ?? "/thienly.glb",
      (gltf) => {
        const scene = gltf.scene;
        if (modelRef.current) {
          modelRef.current.add(scene);
        }
      },
      undefined,
      (error) => {
        console.error("❌ Lỗi load GLB:", error);
      }
    );
  }, []);

  return (
    <group
      ref={modelRef}
      position={[0, 0, 0]}
      // scale={2}
      onPointerOver={() => {
        gl.domElement.style.cursor = "grabbing";
      }}
    >
      <ambientLight color={"#fff"} intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
    </group>
  );
};

const Model = () => {
  const location = useLocation();
  const { title, description, modelUrl } = location.state || {};
  const { hotspotModelId } = useParams();
  const navigate = useNavigate();
  const [hotspotModel, setHotspotModel] = useState<any>(null);

  useEffect(() => {
    console.log("Response data:");
    console.log(
      "Response data:",
      Number.parseInt(hotspotModelId as string, 10)
    );
    const id = Number.parseInt(hotspotModelId as string, 10);
    console.log("Response data:", id);

    // Nếu không phải số hoặc là NaN → không gọi API
    if (isNaN(id)) return;

    const fetchModel = async () => {
      const response = await axios.post(API_URLS.GET_MODEL, {
        hotspotId: hotspotModelId,
      });
      if (response.data.data) {
        setHotspotModel(response.data.data);
      }
    };
    fetchModel();
  }, [hotspotModelId]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = modelUrl;
    link.download = `${
      !hotspotModel ? (!title ? "Mô hình 3D" : title) : hotspotModel.name
    }.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      title: "Tải xuống thành công",
      text: `Mô hình ${
        !hotspotModel ? (!title ? "Mô hình 3D" : title) : hotspotModel.name
      } đã được tải xuống.`,
      icon: "success",
      timer: 4000,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        icon: "success",
        title: "Đã sao chép!",
        text: "Đường dẫn đã được sao chép vào clipboard",
        timer: 4000,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Không thể sao chép đường dẫn",
        timer: 4000,
        position: "top-end",
        toast: true,
      });
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.option}>
        <button className={styles.option_button} onClick={() => navigate(-1)}>
          <FaAngleLeft className={styles.icon} />{" "}
          <span className={styles.name_option}>Quay lại</span>
        </button>
        <div className={styles.model_info}>
          <p>Mô hình 3D</p>
          <span className={styles.name}>
            {!hotspotModel
              ? !title
                ? "Mô hình 3D"
                : title
              : hotspotModel.name}
          </span>
          <p className={styles.description}>
            {!hotspotModel
              ? !description
                ? "Mô tả mô hình 3D"
                : description
              : hotspotModel.description}
          </p>
        </div>
        <div
          className={styles.avatar}
          style={{ background: `url(${import.meta.env.BASE_URL}avatar.jpg)` }}
        >
          <b className={styles.username}>
            Người tạo:{" "}
            <span style={{color: 'white', marginLeft: '0.5rem' ,fontSize: '20px', fontStyle: 'italic'}}>{!hotspotModel ? "" : hotspotModel.usernameAuthor} </span>
          </b>
        </div>
      </div>
      <div className={styles.share_container}>
        <button
          className={styles.share_button}
          title="Chia sẻ URL"
          onClick={handleShare}
        >
          <FaShareFromSquare className={styles.share_icon} />
        </button>
        <button
          className={styles.share_button}
          title="Tải xuống"
          onClick={handleDownload}
        >
          <FaCloudDownloadAlt className={styles.share_icon} />
        </button>
      </div>
      <Canvas
        shadows
        className={styles.canvas}
        camera={{
          fov: 75,
          position: [0, 4, 6],
          aspect: (window.innerWidth / window.innerHeight) * 0.8,
        }}
      >
        <Node modelUrl={!hotspotModel ? modelUrl : hotspotModel.modelUrl} />
        <OrbitControls
          rotateSpeed={0.5}
          autoRotate={true}
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
};

export default Model;
