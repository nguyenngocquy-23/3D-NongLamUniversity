import { OrbitControls } from "@react-three/drei";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/visitor/tourDetail.module.css";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { FaChartBar, FaChartLine } from "react-icons/fa";
import { FaChartPie, FaComment, FaEye } from "react-icons/fa6";

const TourDetail = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  return (
    <div className={styles.container}>
      <div className={styles.canvas_container}>
        <Canvas
          camera={{
            fov: 75,
            // aspect: windowSize.width / windowSize.height,
            near: 0.1,
            far: 1000,
            position: [0, 0, 0.0000001],
          }}
          className={styles.tourCanvas}
          // style={{ cursor }}
        >
          <UpdateCameraOnResize />
          <TourScene
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            textureCurrent={"/khoa.jpg"}
            lightIntensity={1}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            rotateSpeed={0.2}
          />
        </Canvas>
        <div className={styles.info}>
          <div className={styles.sub_info}>
            <FaChartBar />
            <span className={styles.name}>10</span>
          </div>
          <div className={styles.sub_info}>
            <FaComment />
            <span className={styles.name}>100</span>
          </div>
          <div className={styles.sub_info}>
            <FaEye />
            <span className={styles.name}>1000</span>
          </div>
        </div>
      </div>
      <div className={styles.right_box}>
        <div className={styles.feature}>
          <span className={styles.title}>Tính năng</span>
          <ul className={styles.featureList}>
            <li>Ngưng hoạt động</li>
            <li>Xóa tour</li>
            <li>Cập nhật tour</li>
            <li>Chế độ xem toàn cảnh</li>
          </ul>
        </div>

        <div className={styles.comment}>
          <span className={styles.title}>Bình luận</span>
          <div className={styles.commentBox}>
            <textarea
              placeholder="Nhập bình luận..."
              className={styles.textarea}
            ></textarea>
            <button className={styles.sendBtn}>Gửi</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
