import { OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import styles from "../../styles/nodeItem.module.css";
import * as THREE from "three";
import { useState } from "react";

interface NodeProps {
  panoramaURL: string;
}

const Node: React.FC<NodeProps> = ({ panoramaURL }) => {
  const texture = useTexture(panoramaURL);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh>
      <sphereGeometry args={[100, 128, 128]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

interface NodeItemProps {
  onclick: () => void;
}

export const NodeItem = ({onclick}:NodeItemProps) => {
  const [isShow, setIsShow] = useState(false);

  const handleMouseEnter = () => {
    setIsShow(true);
  }
  const handleMouseLeave = () => {
    setIsShow(false);
  }
  return (
    <div className={styles.container} onClick={onclick}>
      <Canvas camera={{ fov: 75, position: [0, 0, 1] }} className={`${styles.canvas} ${isShow ? styles.show : styles.hide}`}>
        <Node panoramaURL={"http://res.cloudinary.com/dkoc6kbg1/image/upload/v1743764249/ytpe4houlfanawvz2scc.jpg"} />
        <OrbitControls autoRotate={true} autoRotateSpeed={1} />
      </Canvas>
      <div className={styles.info} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className={styles.header}>
          <b>Giảng đường</b>
          <b>Rạng Đông</b>
        </div>
        <div className={styles.name}>
          <b>Tiền sãnh</b>
        </div>
        <div className={styles.footer}>
          <div className={styles.status}>
            <div className={styles.status_open}></div>
            <b>Đang hoạt động</b>
          </div>
          <b>3/3/2025</b>
        </div>
      </div>
    </div>
  );
};
