import { OrbitControls, useTexture } from "@react-three/drei";
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
  updatedAt,
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
      <div
        className={styles.info}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img src={url} alt="" />
        <div className={styles.name}>
          <span>
            {name} #{id}
          </span>
        </div>

        <div className={styles.footer}>
          <div
            className={`${styles.status} ${
              status === 0 ? styles.status_stop : styles.status_open
            }`}
          >
            {status == 0 ? (
              <span>Hoạt động</span>
            ) : status == 1 ? (
              <span>Tạm ngưng</span>
            ) : (
              <span>Đang hoạt động</span>
            )}
          </div>
          {/* <b>{formatTimestampToDate(updatedAt)}</b> */}
        </div>
        <hr />
        <div className={styles.by_user}>
          <div className={styles.by_user_wrapper}>
            <img src="/avatar.jpg" alt="" />
            <p>
              <ins>Người tạo: </ins>
              {userId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
