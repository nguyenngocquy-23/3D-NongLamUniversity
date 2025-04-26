import { OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import styles from "../../styles/nodeItem.module.css";
import * as THREE from "three";
import { useState } from "react";
import { formatTimestampToDate } from "../../utils/formatTimestamp";

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
  id: number;
  userId: number;
  status: number;
  name: string;
  fieldName: string;
  spaceName: string;
  description: string;
  url: string;
  updatedAt: number;
}

export const NodeItem = ({
  onclick,
  id,
  userId,
  status,
  name,
  fieldName,
  spaceName,
  description,
  url,
  updatedAt
}: NodeItemProps) => {
  const [isShow, setIsShow] = useState(false);

  const handleMouseEnter = () => {
    setIsShow(true);
  };
  const handleMouseLeave = () => {
    setIsShow(false);
  };
  return (
    <div className={styles.container} onClick={onclick}>
      <Canvas
        camera={{ fov: 75, position: [0, 0, 1] }}
        className={`${styles.canvas} ${isShow ? styles.show : styles.hide}`}
      >
        <Node panoramaURL={url} />
        <OrbitControls autoRotate={true} autoRotateSpeed={1} />
      </Canvas>
      <div
        className={styles.info}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.header}>
          <b>{fieldName}</b>
          <b>{spaceName}</b>
        </div>
        <div className={styles.name}>
          <b>{name}</b>
        </div>
        <div className={styles.footer}>
          <div className={styles.status}>
            {status == 0 ? (
              <>
                <div className={styles.status_stop}></div>
                <b>Ngưng hoạt động</b>
              </>
            ) : status == 1 ? (
              <>
                <div className={styles.status_open}></div>
                <b>Đang hoạt động</b>
              </>
            ) : (
              <>
                <div className={styles.status_open}></div>
                <b>Đang hoạt động <span style={{color:'red'}}>*</span></b>
              </>
            )}
          </div>
          <b>{formatTimestampToDate(updatedAt)}</b>
        </div>
      </div>
    </div>
  );
};
