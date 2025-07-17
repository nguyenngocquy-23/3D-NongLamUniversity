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
import { FaCloudDownloadAlt, FaRegEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { API_URLS } from "../../env";
import LightDial from "../LightDial";

interface NodeProps {
  modelUrl: string;
  color: string;
  lightPosition: [number, number, number];
  intensity: number;
}

const Node: React.FC<NodeProps> = ({
  modelUrl,
  color,
  lightPosition,
  intensity,
}) => {
  const modelRef = useRef<THREE.Group>(null);
  const { gl } = useThree();

  useEffect(() => {
    if (!modelUrl) return;
    const loader = new GLTFLoader();
    console.error("Load GLB:");
    loader.load(
      modelUrl ?? "/thienly.glb",
      (gltf) => {
        const scene = gltf.scene;

        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const minY = box.min.y;

        // ✅ Canh lại mô hình sao cho chạm đất
        scene.position.y -= minY;

        if (modelRef.current) {
          modelRef.current.add(scene);
        }
      },
      undefined,
      (error) => {
        console.error("❌ Lỗi load GLB:", error);
      }
    );
  }, [modelUrl]);

  // ✅ Chỉ update màu vật liệu nếu có thay đổi
  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        materials.forEach((mat) => {
          const stdMat = mat as THREE.MeshStandardMaterial;

          // ✅ Không gán map = null nếu model gốc cần texture
          // ✅ Thay vì xóa map, bạn nên giữ nếu không cần đổi màu toàn bộ
          if (!stdMat.map) {
            try {
              stdMat.color.set(color);
              stdMat.metalness = 0.1; // thấp để không bị đen
              stdMat.roughness = 0.7;
            } catch (e) {
              console.warn("⚠️ Màu không hợp lệ:", color);
            }
            stdMat.needsUpdate = true;
          }
        });
      }
    });
  }, [color]);

  return (
    <>
      <group
        ref={modelRef}
        position={[0, 0, 0]}
        onPointerOver={() => {
          gl.domElement.style.cursor = "grabbing";
        }}
      >
        {/* Ánh sáng rất quan trọng */}
        <ambientLight intensity={1.5} />
        <directionalLight castShadow position={lightPosition} intensity={intensity} />
        <pointLight position={[10, 10, 10]} intensity={2.5} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#707070" />
      </mesh>
    </>
  );
};

const Model = () => {
  const location = useLocation();
  const { title, description, modelUrl } = location.state || {};
  const { hotspotModelId } = useParams();
  const navigate = useNavigate();
  const [hotspotModel, setHotspotModel] = useState<any>(null);
  const [color, setColor] = useState("#ffffff");
  const [autoRotate, setAutoRotate] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [theta, setTheta] = useState(45);

  const radius = 10;
  const lightPosition: [number, number, number] = [
    radius * Math.cos(THREE.MathUtils.degToRad(theta)),
    10,
    radius * Math.sin(THREE.MathUtils.degToRad(theta)),
  ];
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
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

  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = modelUrl;
    link.download = `${
      !hotspotModel ? (!title ? "Mô hình 3D" : title) : hotspotModel.name
    }.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      const response = await axios.post(API_URLS.INCREASE_NUM_DOWNLOAD_MODEL, {
        hotspotId: hotspotModelId,
      });
      if (response.data.data) {
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
      }
    } catch (error) {
      console.error("Error increasing download count:", error);
      Swal.fire({
        title: "Gặp sự cố khi tải xuống",
        text: "Vui lòng kiểm tra lại file tải xuống.",
        icon: "error",
        timer: 4000,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
      });
    }
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
            <span
              style={{
                color: "white",
                marginLeft: "0.5rem",
                fontSize: "20px",
                fontStyle: "italic",
              }}
            >
              {!hotspotModel ? "" : hotspotModel.usernameAuthor}{" "}
            </span>
          </b>
        </div>
      </div>
      <div className={styles.share_container}>
        <button
          className={`${styles.share_button} ${openEdit ? styles.active : ""}`}
          title="Chỉnh sửa mô hình"
          onClick={() => setOpenEdit((prev) => !prev)}
        >
          <FaRegEdit className={styles.share_icon} />
        </button>
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
      <div
        className={`${styles.edit_model_container} ${
          openEdit ? styles.open_edit : ""
        }`}
      >
        <label htmlFor="colorPicker" className={styles.label}>
          Màu mô hình:
        </label>
        <input
          type="color"
          id="colorPicker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className={styles.color_picker}
        />
        <label htmlFor="colorPicker" className={styles.label}>
          Hướng ánh sáng:
          <input
            style={{ marginLeft: "0.5rem" }}
            type="checkbox"
            checked={autoRotate}
            onChange={() => setAutoRotate(!autoRotate)}
          />
        </label>
        <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
          <LightDial
            theta={theta}
            onChange={setTheta}
            autoRotate={autoRotate}
          />
          <input
            type="range"
            min={1}
            max={10}
            step={0.1}
            value={intensity}
            onChange={(e) => setIntensity(+e.target.value)}
            className={styles.vertical_slider}
          />
        </div>
      </div>
      <Canvas
        shadows
        className={styles.canvas}
        camera={{
          fov: 75,
          position: [0, 4, 6],
          // aspect: (window.innerWidth / window.innerHeight) * 0.8,
        }}
      >
        <Node
          modelUrl={!hotspotModel ? modelUrl : hotspotModel.modelUrl}
          color={color}
          intensity={intensity}
          lightPosition={lightPosition}
        />
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
