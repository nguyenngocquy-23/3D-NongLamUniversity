import React, { useRef, useEffect, useState, useMemo } from "react";
import styles from "../styles/createTourStep2.module.css";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaAngleLeft } from "react-icons/fa6";
import { OrbitControls, useTexture } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/Store.tsx";

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

interface NodeProps { 
  url: string;
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  lightIntensity: number;
}

const Node: React.FC<NodeProps> = ({
  url,
  radius,
  sphereRef,
  lightIntensity,
}) => {
  const texture = useTexture(url);
  // const texture = new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh
      ref={(el) => {
        if (el && sphereRef) {
          sphereRef.current = el;
          console.log("sphereRef được gán trong Node:", sphereRef.current);
        }
      }}
    >
      <ambientLight intensity={lightIntensity} color="#ffffff" />
      <pointLight
        position={[100, 100, 100]}
        color="#ffcc00"
        castShadow
        intensity={lightIntensity}
      />
      <directionalLight
        position={[5, 5, 5]}
        intensity={lightIntensity}
        color="#ffffff"
        castShadow
      />
      <sphereGeometry args={[radius, 128, 128]} />
      <meshStandardMaterial map={texture} side={THREE.BackSide} /> // sử dụng
      standard để phản chiếu ánh sáng, basic thì không
    </mesh>
  );
};

interface SceneProps {
  cameraPosition: [number, number, number];
}

const Scene = ({ cameraPosition }: SceneProps) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.updateProjectionMatrix(); // Cập nhật lại camera
  }, [cameraPosition]); // Chạy mỗi khi cameraPosition thay đổi

  return null;
};

const UpdateNode: React.FC = () => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const dispatch = useDispatch<AppDispatch>(); // hotspot
  const sphereRef = useRef<THREE.Mesh | null>(null);

  const [lightIntensity, setLightIntensity] = useState(2);
  const [autoRotate, setAutoRotate] = useState(false);
  const [speedRotate, setSpeedRotate] = useState(1);
  const [angle, setAngle] = useState(90); // Góc quay quanh trục Y
  const radius = 100; // Bán kính quay
  const originalZ = 0.0000001; // Bán kính quay

  // Tính toán vị trí camera từ góc quay quanh trục Y
  const cameraPosition = useMemo((): [number, number, number] => {
    const radians = (angle * Math.PI) / 180; // Chuyển độ sang radian
    // return [radius * Math.cos(radians), 0, radius * Math.sin(radians) + 0.1]; // Camera quay quanh trục Y
    return [originalZ * Math.cos(radians), 0, originalZ * Math.sin(radians)]; // Camera quay quanh trục Y
  }, [angle]);

  const navigate = useNavigate();
  const location = useLocation();
  const tourData = location.state;

  console.log("Tour nhận được:", tourData);

  const handleClose = () => {
    console.log('close manage tour')
    navigate("/admin/manageTour");
  };

  return (
    <div className={styles.preview_tour}>
      <Canvas
        camera={{
          fov: 75,
          position: cameraPosition,
          aspect: window.innerWidth / window.innerHeight,
        }}
      >
        <Node
          url={tourData.url ?? "/khoa.jpg"}
          radius={radius}
          sphereRef={sphereRef}
          lightIntensity={tourData.lightIntensity}
        />
        <Scene cameraPosition={[tourData.positionX, tourData.positionY, tourData.positionZ]} />
        <OrbitControls
          rotateSpeed={0.5}
          autoRotate={tourData.autoRotate}
          autoRotateSpeed={tourData.speedRotate}
        />
      </Canvas>
      <div className={styles.header_tour}>
        <div className={styles.step_title}>
          <FaAngleLeft className={styles.back_btn} onClick={()=>handleClose()} />
          <h2> Quay lại</h2>
        </div>
      </div>
    </div>
  );
};

export default UpdateNode;
