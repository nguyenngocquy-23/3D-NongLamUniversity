// Import Libraries

import { useScroll, useTransform, motion } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import React, { useEffect, useRef, useState } from "react";
import styles from "./touroverview.module.css";

import {
  FaArrowsToEye,
  FaLanguage,
  FaPause,
  FaPlay,
  FaVolumeHigh,
} from "react-icons/fa6";
import { FaInfoCircle, FaSearch } from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
const TourOverview = () => {
  // Variables ------ Start
  const container = useRef<HTMLDivElement>(null);

  const scroll = useScroll();

  const y = useTransform(scroll.scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  /** Xử lý bởi Quý */
  const [isAnimation, setIsAnimation] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  let animationFrameId: number | null = null;

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  // Variables ------ End

  const handleAnimationChange = () => {
    setIsAnimation((prevState) => !prevState);
  };

  const requestFullscreen = (element: any) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      // Chrome, Safari và Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleMouseEnterMenu = (event: any) => {
    const mouse = event.clientX;

    const threshold = window.innerWidth * 0.05;
    if (mouse < threshold) {
      setIsMenuVisible(true);
    }
  };

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  const toggleFullscreen = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      `.${styles.virtual_tour}`
    );
    if (!canvas) {
      console.log("Không tìm thấy canvas");
      return;
    }

    if (!isFullscreen) {
      requestFullscreen(canvas); // Chuyển canvas sang fullscreen
      setIsFullscreen(true);
    } else {
      exitFullscreen(); // Thoát fullscreen
      setIsFullscreen(false);
    }
  };

  const handleVirtualTour = () => {
    const vt = document.querySelector<HTMLCanvasElement>("#tour");
    const tour = document.querySelector<HTMLElement>(
      `.${styles.containCanvas}`
    );

    if (!vt) {
      return;
    } else if (!tour) {
      return;
    } else {
      const parent = vt.parentElement;
      if (parent) {
        console.log("oke");
        parent.style.display = "block";
        tour.style.display = "none";
        setIsOpen(true);
      } else {
        return;
      }
    }
  };

  const handleClose = () => {
    const vt = document.querySelector<HTMLCanvasElement>("#tour");
    const tour = document.querySelector<HTMLElement>(
      `.${styles.containCanvas}`
    );

    if (!vt) {
      return;
    } else if (!tour) {
      return;
    } else {
      const parent = vt.parentElement;
      if (parent) {
        parent.style.display = "none";
        tour.style.display = "block";
        setIsOpen(false);
        exitFullscreen(); // Thoát fullscreen
        setIsFullscreen(false);
      } else {
        return;
      }
    }
  };

  const toggleInfomation = () => {
    // dependen data scene
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

    let zoomLevel = 0; // Biến để lưu mức độ zoom

    const zoomCamera = (delta: any) => {
      // Cập nhật mức zoom
      zoomLevel += delta;

      // Giới hạn mức zoom
      zoomLevel = THREE.MathUtils.clamp(zoomLevel, -200, 0);

      // Lấy hướng nhìn của camera (hướng từ camera đến target)
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      // Tính toán vị trí camera mới
      const distance = 500 + zoomLevel; // Khoảng cách từ camera đến target
      const newPosition = new THREE.Vector3()
        .copy(controls.target) // Lấy vị trí của target
        .add(direction.multiplyScalar(-distance)); // Lùi lại theo hướng nhìn

      // Di chuyển camera đến vị trí mới
      camera.position.lerp(newPosition, 0.1);

      // Cập nhật lại FOV nếu cần (tùy chọn)
      camera.fov = THREE.MathUtils.lerp(75, 25, Math.abs(zoomLevel) / 200);
      camera.updateProjectionMatrix();
    };

    const underTexture = new THREE.TextureLoader().load("../public/under.png");

    const underGeometry = new THREE.CircleGeometry(30);
    const underMaterial = new THREE.MeshBasicMaterial({
      map: underTexture,
      // color: 0x0000ff,
      side: THREE.DoubleSide,
    });
    const underBgk = new THREE.Mesh(underGeometry, underMaterial);
    underBgk.position.set(0, -30, 0);
    underBgk.rotation.x -= Math.PI / 2;
    sphere.add(underBgk);

    // // -- Node hơi khó để nhúng 1 element HTML vào sphere (đang tìm giải pháp) --

    // // Tạo một canvas để vẽ div vào đó
    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");

    // // Cài đặt kích thước canvas
    // canvas.width = 40;
    // canvas.height = 40;

    // // Thêm một event listener để cập nhật texture từ div vào mỗi frame
    // const videoTexture = new THREE.CanvasTexture(canvas);

    // // Tạo một mesh với video texture
    // const nodeGeometry = new THREE.CircleGeometry(10);
    // const nodeMaterial = new THREE.MeshBasicMaterial({
    //   map: videoTexture,
    // });

    // // Tạo mesh và thêm vào scene
    // const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    // node.position.set(90, -5, -25);
    // sphere.add(node);

    // // Đặt thời gian cập nhật texture, ví dụ: mỗi 100ms
    // let lastUpdateTime = Date.now();
    // const updateInterval = 100; // Cập nhật mỗi 100ms

    // // Hàm cập nhật canvas từ div
    // function updateTexture() {
    //   // Lấy phần tử div từ DOM
    //   const div = document.querySelector(`.${styles.containNode}`);
    //   if (!div || !ctx) return;

    //   // Kiểm tra thời gian đã trôi qua kể từ lần cập nhật cuối
    //   const currentTime = Date.now();
    //   if (currentTime - lastUpdateTime >= updateInterval) {
    //     lastUpdateTime = currentTime;

    //     // Dùng html2canvas để render div thành canvas
    //     html2canvas(div).then((renderedCanvas) => {
    //       // Vẽ canvas mới vào canvas Three.js
    //       ctx.clearRect(0, 0, canvas.width, canvas.height);
    //       ctx.drawImage(renderedCanvas, 0, 0, canvas.width, canvas.height);

    //       // Cập nhật texture của Three.js
    //       videoTexture.needsUpdate = true;
    //     });
    //   }

    //   // Lặp lại mỗi frame
    //   requestAnimationFrame(updateTexture);
    // }

    // // Bắt đầu cập nhật texture
    // updateTexture();

    // sự kiện hover hiển thị thông tin
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    document.addEventListener("mousemove", (event) => {
      // Chuyển đổi vị trí chuột từ pixel sang hệ tọa độ [-1, 1]
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Cập nhật raycaster
      raycaster.setFromCamera(mouse, camera);

      // Kiểm tra va chạm trong sphere ( Dễ nhầm lẫn với scene )
      const intersects = raycaster.intersectObjects(sphere.children);
      if (
        intersects.length > 0
        // && document.querySelector("main")?.style.display === "none"
      ) {
        const hoveredObject = intersects[0].object;

        // Kiểm tra nếu đối tượng là moon
        if (hoveredObject === node) {
          // alert("enter node");
        }
      } else {
        // alert("leave node");
      }
    });

    // Sự kiện lăn chuột
    window.addEventListener("wheel", (event) => {
      const delta = event.deltaY * 0.1; // Tính toán độ zoom
      if (isOpen) {
        zoomCamera(-delta); // Gọi hàm zoom (đổi dấu để zoom in/out đúng)
      }
    });

    let rotationY = 0;

    // Thêm phần cập nhật cho animation chung
    function animate() {
      if (!isAnimation) {
        return;
      }
      // requestAnimationFrame(animate);
      animationFrameId = requestAnimationFrame(animate); // Lặp lại khi isAnimation là true

      // Chuyển đổi giữa các cảnh hoặc điều chỉnh vật thể
      rotationY += 0.001;

      sphere.rotation.y = rotationY;
      controls.update();
      if (isOpen) {
        rendererTour.render(scene, camera); // Render cho canvasTour khi isOpen là true
      } else {
        rendererIntroTour.render(scene, camera); // Render cho canvasIntroTour khi isOpen là false
      }
    }

    if (isAnimation) {
      animate();
    }

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
        console.log(event.clientX, event.clientY);
        console.log(rect.left, rect.top);
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

    const pauseBtn = document.querySelector<HTMLElement>(`.${styles.pauseBtn}`);

    pauseBtn?.addEventListener("click", () => {
      setIsAnimation(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Dừng vòng lặp animation
      }
    });
    const playBtn = document.querySelector<HTMLElement>(`.${styles.playBtn}`);

    playBtn?.addEventListener("click", () => {
      setIsAnimation(true);
      animate();
    });

    // Cleanup function để giải phóng tài nguyên
    return () => {
      rendererIntroTour.dispose();
      rendererTour.dispose();
    };
  }, [isOpen]); // Thêm dependancy nếu bạn muốn cập nhật lại khi thay đổi isAnimation

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
              onClick={handleAnimationChange}
              style={{ display: isAnimation ? "block" : "none" }}
            />
            <FaPlay
              className={styles.play}
              onClick={handleAnimationChange}
              style={{ display: isAnimation ? "none" : "block" }}
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

      <div className={styles.virtual_tour} onMouseMove={handleMouseEnterMenu}>
        {/* main - canvas */}
        <canvas
          id="tour"
          onClick={handleCloseMenu}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ cursor: cursor }}
        />
        <div className={styles.containNode}>
          <div className={styles.borderNode}></div>
          <div className={styles.node}></div>
          <div className={styles.subNode}></div>
        </div>
        {/* Header chứa logo + close */}
        <div className={styles.headerTour}>
          <h2>NLU360</h2>
          <IoIosCloseCircle
            className={styles.close_btn}
            onClick={handleClose}
          />
        </div>
        {/* Menu bên trái */}
        <div
          className={`${styles.leftMenu} ${isMenuVisible ? styles.show : ""}`}
        >
          <h2>NLU Tour</h2>
          <div className={styles.search}>
            <input type="text" className={styles.inputSeach} />
            <FaSearch className={styles.searchBtn} />
          </div>
          <ul>
            <li>Scene 1</li>
            <li>Scene 2</li>
            <li>Scene 3</li>
            <li>Scene 4</li>
            <li>Scene 5</li>
          </ul>
        </div>
        {/* Hộp thông tin */}
        <div className={styles.infoBox}>
          <p>
            After you tour our campus virtually, take the next step and join us
            for an online information session! In these hour-long sessions, an
            admission officer and a student will share information about Harvard
            College and answer the questions you submit through.
          </p>
        </div>
        {/* Footer chứa các tính năng */}
        <div className={styles.footerTour}>
          <i>NLU360</i>
          <div className="contain_extension" style={{ display: "flex" }}>
            <FaPause
              className={styles.pauseBtn}
              style={{ display: isAnimation ? "block" : "none" }}
            />
            <FaPlay
              className={styles.playBtn}
              style={{ display: isAnimation ? "none" : "block" }}
            />
            <FaLanguage
              className={styles.info_btn}
              onClick={toggleInfomation}
            />
            <FaVolumeHigh
              className={styles.info_btn}
              onClick={toggleInfomation}
            />
            <FaInfoCircle
              className={styles.info_btn}
              onClick={toggleInfomation}
            />
            {isFullscreen ? (
              <MdFullscreenExit
                className={styles.fullscreen_btn}
                onClick={toggleFullscreen}
              />
            ) : (
              <MdFullscreen
                className={styles.fullscreen_btn}
                onClick={toggleFullscreen}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverview;
