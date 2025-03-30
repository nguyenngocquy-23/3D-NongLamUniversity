import TourScene from "../../components/visitor/TourScene";
import FullScreenToggle from "../../components/visitor/FullScreenToggle";
import StatsPanel from "../../components/visitor/StatsPanel";
import SoundControl from "../../components/visitor/SoundControl";
import { Canvas, useThree } from "@react-three/fiber";
import styles from "../../styles/virtualTour.module.css";
import CamControls from "../../components/visitor/CamControls";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RaycasterHandler from "../../hook/RaycasterHandler";

/**
 *
 * Dành cho việc resize camera và canvas.
 */

const UpdateCameraOnResize = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const handleResize = () => {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      perspectiveCamera.updateProjectionMatrix();
      gl.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [camera, gl]);
  return null;
};

const VirtualTour = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    console.log("sphereRef.current trong VirtualTour:", sphereRef.current);
  }, [sphereRef.current]);

  useEffect(() => {
    let resizeTimer: number;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const radius = 100;

  // const [hotspots, setHotspots] = useState<
  //   { id: number; position: [number, number, number] }[]
  // >([]);

  // const handleAddHotspot = (position: [number, number, number]) => {
  //   setHotspots((prev) => [...prev, { id: prev.length + 1, position }]);
  // };

  return (
    <div className={styles.tourContainer}>
      <Canvas
        camera={{
          fov: 75,
          aspect: windowSize.width / windowSize.height,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0.1], // Đặt vị trí mặc định của camera
        }}
        className={styles.tourCanvas}
      >
        <UpdateCameraOnResize />
        <TourScene radius={radius} sphereRef={sphereRef} />
        <CamControls radius={radius} />
        <RaycasterHandler sphereRef={sphereRef} />

        {/* Render danh sách GroundHotspot
        {hotspots.map((hotspot) => (
          <GroundHotspot
            key={hotspot.id}
            position={hotspot.position}
            onClick={() => console.log(`Clicked ${hotspot.id}`)}
          />
        ))} */}
        {/* <HotspotPlacer onPlace={handleAddHotspot} /> */}
      </Canvas>
      <div className={styles.tourIcons}>
        <FullScreenToggle className={styles.fullScreenToggle} />
        <SoundControl className={styles.fullScreenToggle} />
      </div>
      <StatsPanel className={styles.statsPanel} />
    </div>
  );
};

export default VirtualTour;
