// Import Libraries

import { useScroll, useTransform, motion } from "framer-motion";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import styles from "../../styles/tourOverview.module.css";

import { FaArrowsToEye, FaPause, FaPlay } from "react-icons/fa6";
import UpdateCameraOnResize from "../UpdateCameraOnResize";
import TourScene from "./TourScene";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
const TourOverview = ({ defaultNode }: { defaultNode: any }) => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);

  const scroll = useScroll();

  const y = useTransform(scroll.scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const sphereRef = useRef<THREE.Mesh | null>(null);

  const handleVirtualTour = () => {
    navigate("/virtualTour");
  };

  useEffect(() => {
    function moveDivWithMouse() {
      const myDiv = document.getElementById("myDiv");
      const parent = document.querySelector<HTMLDivElement>(
        `.${styles.containCanvas}`
      ); // Đảm bảo styles.containCanvas là đúng

      if (!myDiv || !parent) return;

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      const lerpSpeed = 0.1; // Tốc độ di chuyển (thấp hơn là di chuyển chậm hơn)

      // Hàm để di chuyển div mượt mà
      function updatePosition() {
        // Tính toán khoảng cách di chuyển từ vị trí hiện tại tới vị trí mục tiêu
        currentX += (targetX - currentX) * lerpSpeed;
        currentY += (targetY - currentY) * lerpSpeed;

        if (!myDiv || !parent) return;

        // Cập nhật vị trí của div
        myDiv.style.left = `${currentX - myDiv.offsetWidth / 2}px`;
        myDiv.style.top = `${currentY - myDiv.offsetHeight / 2}px`;

        // Gọi lại hàm này trong vòng lặp animation
        requestAnimationFrame(updatePosition);
      }

      // Lắng nghe sự kiện di chuyển chuột trên phần tử cha
      parent.addEventListener("mousemove", (event) => {
        // Lấy tọa độ chuột tương ứng với vị trí trong phần tử cha
        const rect = parent.getBoundingClientRect();
        targetX = event.clientX - rect.left;
        targetY = event.clientY - rect.top;
      });

      parent.addEventListener("mouseleave", () => {
        // Di chuyển div về vị trí ban đầu khi chuột rời khỏi phần tử cha
        targetX = parent.offsetWidth / 2;
        targetY = parent.offsetHeight / 2;
      });

      // Bắt đầu vòng lặp mượt mà
      updatePosition();
    }

    moveDivWithMouse();
  }, []);

  return (
    <div
      id="tourOverview"
      ref={container}
      className={styles.virtualTourContainer}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className={styles.vtBackground}>
        <motion.div style={{ y }} className={styles.vtBackgroundImage}>
          <h2 className={styles.title}>Tham quan ảo</h2>
          <div className={styles.containCanvas}>
            <div id="myDiv" style={{ position: "absolute" }}>
              <FaArrowsToEye
                className={styles.comein}
                onClick={handleVirtualTour}
              />
              <h2 className={styles.exploreText}>Khám phá ngay!</h2>
            </div>

            {/* intro - canvas */}
            {/* <canvas id="intro-tour" /> */}
            <Canvas
              camera={{
                fov: 75,
                aspect: windowSize.width / windowSize.height,
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
                textureCurrent={defaultNode ? defaultNode.url : "/khoa.jpg"}
                lightIntensity={defaultNode ? defaultNode.lightIntensity : "1"}
              />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
            </Canvas>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TourOverview;
