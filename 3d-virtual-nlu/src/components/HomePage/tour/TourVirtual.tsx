import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import React, { useState, useEffect, useRef } from "react";
import styles from "./TourVirtual.module.css";
import { FaInfoCircle, FaSearch } from "react-icons/fa";
import { FaLanguage, FaPause, FaPlay } from "react-icons/fa6";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import {
  IoIosCloseCircle,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

const TourVirtual = () => {
  const navigate = useNavigate();
  const [isAnimation, setIsAnimation] = useState(true);

  const animationFrameId = useRef<number | null>(null); // Dùng useRef để giữ animationFrameId

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  ); // Giữ lại đối tượng utterance

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

  const handleMouseDown = (event: any) => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = (event: any) => {
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

  const handleClose = () => {
    navigate("/");
  };

  let isOpenInfo = true;
  const toggleInfomation = () => {
    const divInfo = document.querySelector<HTMLElement>(`.${styles.infoBox}`);
    if (!divInfo) {
      return;
    }
    if (isOpenInfo) {
      divInfo.style.display = "block";
      divInfo.style.bottom = "50px";
      isOpenInfo = false;
    } else {
      divInfo.style.display = "none";
      divInfo.style.bottom = "-100px";
      isOpenInfo = true;
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

    const canvasTour = document.querySelector("#tour");
    if (!canvasTour) {
      throw new Error("Canvas element not found");
    }

    // Khởi tạo renderer cho từng canvas
    const rendererTour = new THREE.WebGLRenderer({
      canvas: canvasTour,
    });

    rendererTour.setPixelRatio(window.devicePixelRatio);
    rendererTour.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 500;

    // Tạo geometry và texture chung
    const geometry = new THREE.SphereGeometry(100, 128, 128);
    const texture = new THREE.TextureLoader().load("khoa.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
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

    window.addEventListener("wheel", (event) => {
      const delta = event.deltaY * 0.1; // Tính toán độ zoom
      zoomCamera(-delta); // Gọi hàm zoom (đổi dấu để zoom in/out đúng)
    });

    const under = new THREE.TextureLoader().load("under.png");

    const underGeometry = new THREE.CircleGeometry(30);
    const underMaterial = new THREE.MeshBasicMaterial({
      map: under,
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
    // const raycaster = new THREE.Raycaster();
    // const mouse = new THREE.Vector2();
    // document.addEventListener("mousemove", (event) => {
    //   // Chuyển đổi vị trí chuột từ pixel sang hệ tọa độ [-1, 1]
    //   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //   // Cập nhật raycaster
    //   raycaster.setFromCamera(mouse, camera);

    //   // Kiểm tra va chạm trong sphere ( Dễ nhầm lẫn với scene )
    //   const intersects = raycaster.intersectObjects(sphere.children);
    //   if (
    //     intersects.length > 0
    //     // && document.querySelector("main")?.style.display === "none"
    //   ) {
    //     const hoveredObject = intersects[0].object;

    //     // Kiểm tra nếu đối tượng là moon
    //     if (hoveredObject === node) {
    //       // alert("enter node");
    //     }
    //   } else {
    //     // alert("leave node");
    //   }
    // });

    // Sự kiện lăn chuột

    let rotationY = 0;

    // Thêm phần cập nhật cho animation chung
    function animate() {
      // if (!isAnimation) {
      //   return;
      // }
      // requestAnimationFrame(animate);
      animationFrameId.current = requestAnimationFrame(animate); // Lặp lại khi isAnimation là true

      if (isAnimation) {
        // Chuyển đổi giữa các cảnh hoặc điều chỉnh vật thể
        rotationY += 0.001;
        sphere.rotation.y = rotationY;
      }
      controls.update();
      rendererTour.render(scene, camera);
    }

    // if (isAnimation) {
    animate();
    // }

    const pauseBtn = document.querySelector<HTMLElement>(`.${styles.pauseBtn}`);

    pauseBtn?.addEventListener("click", () => {
      console.log("pause");
      setIsAnimation(false);
      // if (animationFrameId) {
      //   cancelAnimationFrame(animationFrameId); // Dừng vòng lặp animation
      //   animationFrameId = null;
      // }
    });

    const subNode = document.querySelectorAll<HTMLElement>(`.${styles.node}`);

    subNode.forEach((node) => {
      node.addEventListener("click", () => {
        moveAnimation("thuvien.jpg");
      });
    });

    function moveAnimation(texturePath: string) {
      let zoomLevel = 500; // Tương tự như moveAnimation gốc, nhưng dựa theo zoomCamera
      let duration = 3000;
      let startTime = performance.now();

      // Lưu vị trí ban đầu của camera
      const startPosition = camera.position.clone();
      console.log("startPosition:", startPosition);

      function animate() {
        let t = Math.min((performance.now() - startTime) / duration, 1);
        let easedT = easeInOutQuad(t);

        // Lưu hướng nhìn ban đầu của camera
        const startDirection = new THREE.Vector3();
        camera.getWorldDirection(startDirection.clone());
        console.log("startDirection:", startDirection);

        // Lấy hướng nhìn của camera
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        console.log("direction", direction);

        // Tính toán khoảng cách mới dựa trên easing
        const distance = zoomLevel * easedT;

        // Tính toán vị trí mới của camera
        const newPosition = new THREE.Vector3()
          .copy(startPosition)
          .add(direction.multiplyScalar(-distance));

        // Di chuyển camera đến vị trí mới bằng lerp
        camera.position.lerp(newPosition, 0.1);

        console.log(
          `t: ${t.toFixed(2)}, Position: ${camera.position.toArray()}`
        );

        if (t < 1) {
          rendererTour.render(scene, camera);
          requestAnimationFrame(animate);
        } else {
          handleNodeChange(texturePath);
        }
      }

      requestAnimationFrame(animate);
    }

    function handleNodeChange(texturePath: string) {
      if (
        material.map?.image.src !==
        new URL(texturePath, window.location.href).href
      ) {
        material.map?.dispose();
        new THREE.TextureLoader().load(texturePath, (newTexture) => {
          material.map = newTexture;
          material.needsUpdate = true;
          rendererTour.render(scene, camera);
        });
      }
    }

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const playBtn = document.querySelector<HTMLElement>(`.${styles.playBtn}`);

    playBtn?.addEventListener("click", () => {
      setIsAnimation(true);
      // if (!animationFrameId) {
      //   animate(); // Gọi lại vòng lặp nếu chưa có animation frame ID
      // }
    });

    // Cleanup function để giải phóng tài nguyên
    return () => {
      rendererTour.dispose();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // Dừng vòng lặp khi component unmount
      }
    };
  }, []);

  // Hàm để đọc văn bản
  const readText = () => {
    const textInfo = document.querySelector(`.${styles.infoBox}`)?.textContent;
    console.log(textInfo);

    // Kiểm tra xem API SpeechSynthesis có sẵn không
    if ("speechSynthesis" in window) {
      // Kiểm tra nếu textInfo có giá trị trước khi đọc
      if (textInfo) {
        // Nếu không có utterance hiện tại, tạo một đối tượng mới
        if (!utterance) {
          const newUtterance = new SpeechSynthesisUtterance(textInfo);
          // Bạn có thể tùy chỉnh các thuộc tính của lời nói
          newUtterance.lang = "vi-VN"; // Chọn ngôn ngữ (ở đây là tiếng Việt)
          newUtterance.pitch = 1; // Điều chỉnh độ cao của giọng nói
          newUtterance.rate = 1; // Điều chỉnh tốc độ đọc

          // Kiểm tra trạng thái âm thanh
          if (isMuted) {
            newUtterance.volume = 0; // Tắt âm thanh
          } else {
            newUtterance.volume = 1; // Bật âm thanh
          }

          // Lưu đối tượng utterance vào state
          setUtterance(newUtterance);

          // // Sử dụng onend để xử lý sự kiện khi âm thanh kết thúc
          // newUtterance.onend = () => {
          //   // Sau khi phát xong, nghỉ 1 phút rồi tiếp tục
          //   setTimeout(() => {
          //     console.log("Đang tiếp tục sau 1 phút nghỉ");
          //     // Gọi lại hàm đọc văn bản sau 1 phút nghỉ
          //     readText();
          //   }, 5000); // 60000ms = 1 phút
          // };

          // Khởi tạo việc đọc văn bản
          speechSynthesis.speak(newUtterance);
        } else {
          // Nếu âm thanh bị tắt, tạm dừng việc phát âm thanh
          if (isMuted) {
            speechSynthesis.pause();
          } else {
            // Nếu âm thanh bật, tiếp tục phát âm thanh từ điểm dừng
            speechSynthesis.resume();
          }
        }
      } else {
        console.error("Không tìm thấy văn bản để đọc.");
      }
    } else {
      console.error("Speech synthesis API is not supported in this browser.");
    }
  };

  // Hàm bật/tắt âm thanh
  const toggleMute = () => {
    setIsMuted((preState) => !preState);
  };

  // Gọi hàm để đọc văn bản khi thay đổi trạng thái âm thanh
  useEffect(() => {
    readText();
  }, [isAnimation, isMuted]);

  return (
    <>
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
            <li className={styles.node}>
              <span className={styles.nodeName}>Scene 1</span>
            </li>
            <li className={styles.node}>
              <span className={styles.nodeName}>Scene 2</span>
            </li>
            <li className={styles.node}>
              <span className={styles.nodeName}>Scene 3</span>
            </li>
            <li className={styles.node}>
              <span className={styles.nodeName}>Scene 4</span>
            </li>
            <li className={styles.node}>
              <span className={styles.nodeName}>Scene 5</span>
            </li>
          </ul>
        </div>
        {/* Hộp thông tin */}
        <div className={styles.infoBox} onClick={toggleInfomation}>
          Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông
          Lâm Thành phố Hồ Chí Minh
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
            {isMuted ? (
              <IoMdVolumeOff className={styles.info_btn} onClick={toggleMute} />
            ) : (
              <IoMdVolumeHigh
                className={styles.info_btn}
                onClick={toggleMute}
              />
            )}
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
    </>
  );
};

export default TourVirtual;
