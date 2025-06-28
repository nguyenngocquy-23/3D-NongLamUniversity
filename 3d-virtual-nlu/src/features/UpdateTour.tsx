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

const UpdateNode: React.FC = () => {
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

  const handleClose = () => {
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
        {/* <Node
          url={tourData.url ?? "/khoa.jpg"}
          radius={radius}
          sphereRef={sphereRef}
          lightIntensity={tourData.lightIntensity}
        /> */}
        <Scene
          cameraPosition={[
            tourData.positionX,
            tourData.positionY,
            tourData.positionZ,
          ]}
        />
        <OrbitControls
          rotateSpeed={0.5}
          autoRotate={tourData.autoRotate}
          autoRotateSpeed={tourData.speedRotate}
        />
      </Canvas>
      <div className={styles.header_tour}>
        <div className={styles.step_title}>
          <FaAngleLeft
            className={styles.back_btn}
            onClick={() => handleClose()}
          />
          <h2> Quay lại</h2>
        </div>
      </div>
    </div>
  );
};

export default UpdateNode;
