// Import Libraries

import { useScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import styles from "../../styles/tourOverview.module.css";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchPreloadNodes } from "../../redux/slices/DataSlice";
import { Canvas } from "@react-three/fiber";
import UpdateCameraOnResize from "../UpdateCameraOnResize";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { OrbitControls } from "@react-three/drei";
import CurvedScreen from "./CurvedScreen";
import ShadowScreen from "./ShadowScreen";
import { useImageCache } from "../../contexts/ImageCacheContext";
import { buildImageUrlWithQuality } from "../../utils/getCloudinaryURL";
const TourOverview = () => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);

  const scroll = useScroll();

  const y = useTransform(scroll.scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  /**
   * Đưa default node vào redux.
   * Đưa PreloadNodes với defaultnode id ban đầu.
   */
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const sphereRef = useRef<THREE.Mesh | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const defaultNode = useSelector((state: RootState) => state.data.defaultNode);
  const handleVirtualTour = () => {
    navigate("/virtualTour");
  };
  const imageRef = useImageCache();

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
  useEffect(() => {
    const secondary = document.querySelector<HTMLElement>(
      `.${styles.secondary}`
    );
    const container = document.querySelector<HTMLElement>(
      `.${styles.containCanvas}`
    );

    if (!secondary || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      secondary.style.setProperty("--mouse-x", `${x}%`);
      secondary.style.setProperty("--mouse-y", `${y}%`);
    };

    const handleMouseLeave = () => {
      secondary.style.setProperty("--mouse-x", `50%`);
      secondary.style.setProperty("--mouse-y", `50%`);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  //Nạp default node vào ImageCache.
  useEffect(() => {
    if (!defaultNode || !defaultNode.url) return; //Thiếu defaultnode.

    const { id, url } = defaultNode;

    const existing = imageRef.current[id];
    if (existing && existing.quality === "8K") return;

    const loadHighRes = async () => {
      try {
        const highResURL = buildImageUrlWithQuality(url, "8K");
        const response = await fetch(highResURL, { mode: "cors" });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = objectUrl;

        img.onload = () => {
          imageRef.current[id] = {
            img,
            objectUrl,
            quality: "8K",
            lastUsed: Date.now(),
          };
        };
      } catch (err) {
        console.warn("Không load được ảnh mặc định.", id, err);
      }
    };
    loadHighRes();
  }, [defaultNode, imageRef]);

  return (
    <div
      id="tourOverview"
      ref={container}
      className={styles.virtual_tour_container}
      // style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className={styles.vt_background}>
        <h1 className={styles.single} style={{ fontSize: "150px", top: "20%" }}>
          3D TOUR
        </h1>
        <div className={styles.title_container}>
          <h2 className={styles.title} style={{ fontSize: "40px" }}>
            THAM QUAN ẢO
          </h2>
          <i className={styles.title}>
            Chào mừng bạn đến với chuyến tham quan khuôn viên Trường Đại học
            Nông Lâm ...
          </i>
        </div>
        <div className={styles.contain_canvas}>
          <button className={styles.explore_button} onClick={handleVirtualTour}>
            Khám phá ngay!
          </button>

          {/* <canvas id="intro-tour" /> */}
          <Canvas
            camera={{
              fov: 75,
              aspect: windowSize.width / windowSize.height,
              near: 0.1,
              far: 1000,
              position: [0, 0, 200],
            }}
            className={styles.tourCanvas}
          >
            <UpdateCameraOnResize />
            <CurvedScreen
              radius={RADIUS_SPHERE}
              sphereRef={sphereRef}
              textureCurrent={
                defaultNode && imageRef.current[defaultNode.id]
                  ? imageRef.current[defaultNode].img.src
                  : defaultNode
                  ? defaultNode.url
                  : `${import.meta.env.BASE_URL}khoa.jpg`
              }
              lightIntensity={defaultNode ? defaultNode.lightIntensity : "1"}
            />
            <ShadowScreen
              radius={RADIUS_SPHERE}
              sphereRef={sphereRef}
              textureCurrent={
                defaultNode && imageRef.current[defaultNode.id]
                  ? imageRef.current[defaultNode].img.src
                  : defaultNode
                  ? defaultNode.url
                  : `${import.meta.env.BASE_URL}khoa.jpg`
              }
              lightIntensity={defaultNode ? defaultNode.lightIntensity : "1"}
            />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Canvas>
        </div>
        <div className={styles.secondary}></div>
      </div>
    </div>
  );
};

export default TourOverview;
