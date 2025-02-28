import React, { useEffect, useState, useRef } from "react";
import styles from "./Tour.module.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsToEye,
  faCircleXmark,
  faClose,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

function Tour() {
  const [isAnimation, setIsAnimation] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleAnimationChange = () => {
    setIsAnimation((prevState) => !prevState);
  };

  const handleVirtualTour = () => {
    const vt = document.querySelector<HTMLCanvasElement>("#tour");
    const tour = document.querySelector<HTMLElement>(`.${styles.tour}`);
    const h1Tour = document.querySelector<HTMLHeadElement>(`.${styles.h1}`);
    if (!vt) {
      console.log("Không tìm thấy thẻ canvas");
      return;
    } else if (!tour) {
      console.log("Không tìm thấy thẻ tour");
      return;
    } else {
      const parent = vt.parentElement;
      if (parent && h1Tour) {
        console.log("oke");
        parent.style.display = "block";
        tour.style.display = "none";
        h1Tour.style.display = "none";
        setIsOpen(true);
      } else {
        console.log("Không tìm thấy thẻ cha");
        return;
      }
    }
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
    const canvasTour = document.querySelector("#tour");
    if (!canvasIntroTour || !canvasTour) {
      throw new Error("Canvas element not found");
    }

    // Khởi tạo renderer cho từng canvas
    const rendererIntroTour = new THREE.WebGLRenderer({
      canvas: canvasIntroTour,
    });
    const rendererTour = new THREE.WebGLRenderer({
      canvas: canvasTour,
    });

    rendererIntroTour.setPixelRatio(window.devicePixelRatio);
    rendererIntroTour.setSize(window.innerWidth, window.innerHeight);
    rendererTour.setPixelRatio(window.devicePixelRatio);
    rendererTour.setSize(window.innerWidth, window.innerHeight);
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
    const controls = new OrbitControls(camera, rendererTour.domElement);
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
      if (isAnimation) {
        rotationY += 0.001;
      }

      sphere.rotation.y = rotationY;
      controls.update();
      if (isOpen) {
        rendererTour.render(scene, camera); // Render cho canvasTour khi isOpen là true
      } else {
        rendererIntroTour.render(scene, camera); // Render cho canvasIntroTour khi isOpen là false
      }
    }

    animate();

    // Cleanup function để giải phóng tài nguyên
    return () => {
      rendererIntroTour.dispose();
      rendererTour.dispose();
    };
  }, [isAnimation, isOpen]); // Thêm dependancy nếu bạn muốn cập nhật lại khi thay đổi isAnimation

  return (
    <>
      {/* sub-nav */}
      <h1 className={styles.h1}>Virtual Tour</h1>
      <div className={styles.tour}>
        <div className={styles.explore}>
          <h2 style={{ fontFamily: "serif" }}>Explore Nong Lam University</h2>
          <p>
            Use our Virtual Tour to discover spaces that aren't even available
            on an in-person campus tour, such as classrooms, laboratories,
            residence halls, and more. Even better, it's available 24 hours a
            day, seven days a week, and never reaches capacity.
          </p>
        </div>
        <div className={styles.containCanvas}>
          <FontAwesomeIcon
            icon={faPause}
            className={styles.pause}
            onClick={handleAnimationChange}
            style={{ display: isAnimation ? "block" : "none" }}
          ></FontAwesomeIcon>
          <FontAwesomeIcon
            icon={faPlay}
            className={styles.play}
            onClick={handleAnimationChange}
            style={{ display: isAnimation ? "none" : "block" }}
          ></FontAwesomeIcon>
          <FontAwesomeIcon
            icon={faArrowsToEye}
            className={styles.comein}
            onClick={handleVirtualTour}
          ></FontAwesomeIcon>
          <h2 className={styles.exploreText}>Khám phá ngay!</h2>
          {/* intro - canvas */}
          <canvas id="intro-tour" />
        </div>
        <div className={styles.explore}>
          <h2 style={{ fontFamily: "serif" }}>Explore Nong Lam University</h2>
          <p>
            After you tour our campus virtually, take the next step and join us
            for an online information session! In these hour-long sessions, an
            admission officer and a student will share information about Harvard
            College and answer the questions you submit through the chat. View
            our schedule of upcoming sessions and register today!
          </p>
        </div>
      </div>
      <div className={styles.virtual_tour}>
        {/* main - canvas */}
        <canvas id="tour" />
        <div className={styles.headerTour}>
          <h2>NLU360</h2>
          <FontAwesomeIcon icon={faCircleXmark} className={styles.close_btn} />
        </div>
      </div>
    </>
  );
}

export default Tour;
