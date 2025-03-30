import TourScene from "./TourScene";
import FullScreenToggle from "./FullScreenToggle";
import StatsPanel from "./StatsPanel";
import SoundControl from "./SoundControl";
import { Canvas } from "@react-three/fiber";
import styles from "../../styles/virtualTour.module.css";
import CamControls from "./CamControls";

const VirtualTour = () => {
  const radius = 100;

  return (
    <div className={styles.tourContainer}>
      <Canvas
        camera={{
          fov: 75,
          aspect: window.innerWidth / window.innerHeight,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0.1], // Đặt vị trí mặc định của camera
        }}
        className={styles.tourCanvas}
      >
        <TourScene radius={radius} />
        <CamControls radius={radius} />
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
