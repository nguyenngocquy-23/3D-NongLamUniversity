// Import Libraries

import { useScroll, useTransform, motion } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import styles from "../../styles/tourOverview.module.css";


import { FaArrowsToEye, FaPause, FaPlay } from "react-icons/fa6";
const TourOverview = () => {
  const navigate = useNavigate();
  // Variables ------ Start
  const container = useRef<HTMLDivElement>(null);

  const scroll = useScroll();

  const y = useTransform(scroll.scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  // Variables ------ End

  const handleVirtualTour = () => {
    // const vt = document.querySelector<HTMLCanvasElement>("#tour");
    // const tour = document.querySelector<HTMLElement>(
    //   `.${styles.containCanvas}`
    // );

    // if (!vt) {
    //   return;
    // } else if (!tour) {
    //   return;
    // } else {
    //   const parent = vt.parentElement;
    //   if (parent) {
    //     console.log("oke");
    //     navigate("/tourVirtual");
    //   } else {
    //     return;
    //   }
    // }
    navigate("/tourVirtual");
  };

  useEffect(() => {
    // Khởi tạo scene, camera, renderer chung
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const canvasIntroTour = document.querySelector("#intro-tour");
    if (!canvasIntroTour) {
      throw new Error("Canvas element not found");
    }

    // Khởi tạo renderer cho từng canvas
    const rendererIntroTour = new THREE.WebGLRenderer({
      canvas: canvasIntroTour,
    });

    rendererIntroTour.setPixelRatio(window.devicePixelRatio);
    rendererIntroTour.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 500;

    // Tạo geometry và texture chung
    const geometry = new THREE.SphereGeometry(100, 128, 128);
    const textureKhoa = new THREE.TextureLoader().load("khoa.jpg");
    textureKhoa.wrapS = THREE.RepeatWrapping;
    textureKhoa.repeat.x = -1;

    const material = new THREE.MeshBasicMaterial({
      map: textureKhoa,
      side: THREE.BackSide,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Thêm ánh sáng vào scene chung
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Đặt OrbitControls cho camera
    const controls = new OrbitControls(camera, rendererIntroTour.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.3;
    controls.minDistance = 0.001;
    controls.maxDistance = 0.002;
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = -1.0;

    let rotationY = 0;

    // Thêm phần cập nhật cho animation chung
    function animate() {
      requestAnimationFrame(animate);

      // Chuyển đổi giữa các cảnh hoặc điều chỉnh vật thể
      rotationY += 0.001;

      sphere.rotation.y = rotationY;
      controls.update();
      rendererIntroTour.render(scene, camera); // Render cho canvasIntroTour khi isOpen là false
    }

    animate();

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

    // Cleanup function để giải phóng tài nguyên
    return () => {
      rendererIntroTour.dispose();
      controls.dispose(); // Hủy OrbitControls
      scene.clear(); // Hủy các đối tượng trong scene
    };
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
          <h2>Tham quan ảo</h2>
          <div className={styles.containCanvas}>
            <FaPause
              className={styles.pause}
              // onClick={handleAnimationChange}
              // style={{ display: isAnimation ? "block" : "none" }}
            />
            <FaPlay
              className={styles.play}
              // onClick={handleAnimationChange}
              // style={{ display: isAnimation ? "none" : "block" }}
            />
            <div id="myDiv" style={{ position: "absolute" }}>
              <FaArrowsToEye
                className={styles.comein}
                onClick={handleVirtualTour}
              />
              <h2 className={styles.exploreText}>Khám phá ngay!</h2>
            </div>

            {/* intro - canvas */}
            <canvas id="intro-tour" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TourOverview;
