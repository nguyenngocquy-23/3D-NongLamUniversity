import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import styles from "../../styles/model.module.css";
import { FaAngleLeft, FaInbox, FaQuestion } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";

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
      {/* mesh nền */}
      {/* <mesh
        position={[0, -0.6, 0]} // bù trừ theo scale (ví dụ scale = 2, thì -0.25 x 2 = -0.5)
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial
          map={texture}
          color="#ffffff" // trắng để không áp màu
          // emissive="#ffffff" // phát sáng màu trắng nhẹ
          // emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0}
          transparent
          opacity={1}
          side={FrontSide}
        />
      </mesh> */}
      <ambientLight color={"#fff"} intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
    </group>
  );
};

const Model = () => {
  const location = useLocation();
  const { title, description, modelUrl } = location.state || {};
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.option}>
        <button className={styles.option_button} onClick={() => navigate(-1)}>
          <FaAngleLeft className={styles.icon} />{" "}
          <span className={styles.name_option}>Quay lại</span>
        </button>
        <div className={styles.model_info}>
          <p>Mô hình 3D</p>
          <span className={styles.name}>{!title ? "Mô hình 3D" : title}</span>
          <p className={styles.description}>
            {!description ? "Mô tả mô hình 3D" : description}
          </p>
        </div>
        <div
          className={styles.avatar}
          style={{ background: "url('/avatar.jpg')" }}
        >
          <b className={styles.username}>Người tạo: {} </b>
        </div>
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
        <Node modelUrl={modelUrl} />
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
