import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import styles from "../../styles/model.module.css";
import { FaAngleLeft, FaInbox, FaQuestion } from "react-icons/fa6";
import { FrontSide } from "three";

interface NodeProps {
  url: string;
}

const Node: React.FC<NodeProps> = ({ url }) => {
  const modelRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [rotate, setRotate] = useState(true);

  // const texture = useTexture("/floor.png");

  useEffect(() => {
    const loader = new GLTFLoader();
    console.error("Load GLB:");
    loader.load(
      "/thienly.glb",
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

interface ModelProps {
  onClose: () => void;
  title: string;
  fields: { label: string; name: string; type: string }[]; // Danh sách các trường
  apiUrl: string; // URL để gọi API
}

const Model: React.FC<ModelProps> = ({ onClose, title, fields, apiUrl }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleFadeOut = () => {
    setFadeOut(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.option}>
        <button className={styles.option_button}>
          <FaAngleLeft className={styles.icon} />{" "}
          <span className={styles.name_option}>Quay lại</span>
        </button>
        <button className={styles.option_button}>
          <FaInbox className={styles.icon} />{" "}
          <span className={styles.name_option}>Tính năng</span>
        </button>
        <button className={styles.option_button}>
          <FaQuestion className={styles.icon} />{" "}
          <span className={styles.name_option}>Thông tin</span>
        </button>
      </div>
      <Canvas
        className={styles.canvas}
        camera={{
          fov: 75,
          position: [0, 4, 6],
          aspect: window.innerWidth / window.innerHeight,
        }}
      >
        <Node url={"/khoa.jpg"} />
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
