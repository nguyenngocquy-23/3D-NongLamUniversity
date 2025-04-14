import TourScene from "../../components/visitor/TourScene";
import FullScreenToggle from "../../components/visitor/FullScreenToggle";
import StatsPanel from "../../components/visitor/StatsPanel";
import SoundControl from "../../components/visitor/SoundControl";
import { Canvas, useThree } from "@react-three/fiber";
import styles from "../../styles/virtualTour.module.css";
import CamControls from "../../components/visitor/CamControls";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RaycasterHandler from "../../components/visitor/RaycasterHandler";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import gsap from "gsap";
import { useTexture } from "@react-three/drei";

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

const VideoNode: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  useEffect(() => {
    // Tạo video element
    const video = document.createElement("video");
    video.src = "/video.mp4"; // Đường dẫn tới video
    video.crossOrigin = "anonymous"; // Thêm nếu video nằm trên domain khác
    video.loop = true; // Lặp video
    video.muted = true; // Tắt âm thanh
    video.play(); // Bắt đầu phát video
    video.style.position = "absolute";
    video.style.zIndex = "10000";

    // Tạo video texture
    const texture = new THREE.VideoTexture(video);
    textureRef.current = texture;

    return () => {
      // Dọn dẹp khi component bị gỡ bỏ
      video.pause();
      video.src = ""; // Giải phóng tài nguyên
      texture.dispose(); // Giải phóng texture
    };
  }, []);

  return (
    <mesh position={[0, 0, -10]} rotation={[0, Math.PI, 0]}>
      <cylinderGeometry args={[10, 10, 10, 64, 1, true, 0, Math.PI / 2]} />
      <meshBasicMaterial map={textureRef.current} side={THREE.DoubleSide} />
    </mesh>
  );
};

const VirtualTour = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [sphereCenter, setSphereCenter] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null); //test

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    console.log("sphereRef.current trong VirtualTour:", sphereRef.current);
  }, [sphereRef.current]);

  const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null); //test

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

  const [hotspots, setHotspots] = useState<
    { id: number; position: [number, number, number] }[]
  >([]);

  const handleAddHotspot = (position: [number, number, number]) => {
    setHotspots((prev) => [...prev, { id: prev.length + 1, position }]);
  };

  const handledSwitchTexture = (newPosition: [number, number, number]) => {
    if (sphereRef.current) {
      const material = sphereRef.current.material as THREE.MeshBasicMaterial;
      const newTexture = material.map?.image.src.includes("khoa.jpg")
        ? new THREE.TextureLoader().load("thuvien.jpg")
        : new THREE.TextureLoader().load("khoa.jpg");
      newTexture.wrapS = THREE.RepeatWrapping;
      newTexture.repeat.x = -1;

      gsap.to(material, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          material.map = newTexture;
          material.needsUpdate = true;
          gsap.to(material, { opacity: 1, duration: 0.5 });
        },
      });

      //   setTargetPosition(newPosition); //test: Lưu vị trí mới vào state TEST
      //   console.log("Đã đổi texture!");
      // }
      setSphereCenter(newPosition);
      setHotspots((prevHotspots) =>
        prevHotspots.map(({ id, position }) => ({
          id,
          position: [
            position[0] - newPosition[0],
            position[1] - newPosition[1],
            position[2] - newPosition[2],
          ],
        }))
      );
    }
  };

  return (
    <div className={styles.tourContainer}>
      <Canvas
        camera={{
          fov: 75,
          aspect: windowSize.width / windowSize.height,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0.0000001], // Đặt vị trí mặc định của camera
        }}
        className={styles.tourCanvas}
      >
        <UpdateCameraOnResize />
        <TourScene radius={radius} sphereRef={sphereRef} />
        <CamControls targetPosition={targetPosition} sphereRef={sphereRef} />
        <VideoNode />
        <RaycasterHandler
          sphereRef={sphereRef}
          onAddHotspot={handleAddHotspot}
          hoveredHotspot={hoveredHotspot} //test
          switchTexture={handledSwitchTexture}
        />

        {hotspots.map((hotspot) => (
          <GroundHotspot
            key={hotspot.id}
            position={hotspot.position}
            setHoveredHotspot={setHoveredHotspot}
          />
        ))}
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
