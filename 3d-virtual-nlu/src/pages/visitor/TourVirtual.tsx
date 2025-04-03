import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useState, useEffect, useRef } from "react";
import styles from "../../styles/tourVirtual.module.css";
import { FaInfoCircle, FaSearch } from "react-icons/fa";
import { FaLanguage, FaPause, FaPlay } from "react-icons/fa6";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import {
  IoIosCloseCircle,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Chat from "../../features/Chat";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Canvas, useThree } from "@react-three/fiber";

const TourVirtual = () => {
  const navigate = useNavigate();
  const { gl, set, scene } = useThree();
  const [isAnimation, setIsAnimation] = useState(true);

  const animationFrameId = useRef<number | null>(null); // Dùng useRef để giữ animationFrameId

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh

  const [imagePositions, setImagePositions] = useState<
    [number, number, number][]
  >([]);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  ); // Giữ lại đối tượng utterance

  const handleAnimationChange = () => {
    setIsAnimation((prevState) => !prevState);
  };

  /**
   * Thiết lập statistic cho trang
   */
  var stats = new Stats();
  stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

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
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 500;
    set({ camera });

    console.log("Aspect Ratio: ", window.innerWidth / window.innerHeight);

    // const canvasTour = document.querySelector("#tour");
    if (!gl.domElement) {
      throw new Error("Canvas element not found");
    }

    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(window.innerWidth, window.innerHeight);

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
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.3;
    controls.minDistance = 50;
    controls.maxDistance = 90;
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = -1.0;

    let zoomLevel = 0; // Biến để lưu mức độ zoom

    const zoomCamera = (delta: any) => {
      // Cập nhật mức zoom
      zoomLevel += delta;

      // Giới hạn mức zoom
      zoomLevel = THREE.MathUtils.clamp(zoomLevel, -500, 500);

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

    // Sự kiện lăn chuột

    let rotationY = 0;

    // Thêm phần cập nhật cho animation chung
    function animate() {
      stats.begin();
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
      gl.render(scene, camera);
      stats.end();
    }

    // if (isAnimation) {
    animate();
    // }

    const pauseBtn = document.querySelector<HTMLElement>(`.${styles.pauseBtn}`);

    pauseBtn?.addEventListener("click", () => {
      console.log("pause");
      setIsAnimation(false);
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
          gl.render(scene, camera);
          requestAnimationFrame(animate);
        } else {
          handleNodeChange(texturePath);
        }
      }

      requestAnimationFrame(animate);
    }

    /**
     * Sử dụng để cập nhật lại giao diện người dùng khi màn hình resize.
     */
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();
      gl.setSize(window.innerWidth, window.innerHeight);
      gl.render(scene, camera);
    }
    window.addEventListener("resize", onWindowResize, false);

    function handleNodeChange(texturePath: string) {
      if (
        material.map?.image.src !==
        new URL(texturePath, window.location.href).href
      ) {
        material.map?.dispose();
        new THREE.TextureLoader().load(texturePath, (newTexture) => {
          material.map = newTexture;
          material.needsUpdate = true;
          gl.render(scene, camera);
        });
      }
    }

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const playBtn = document.querySelector<HTMLElement>(`.${styles.playBtn}`);

    playBtn?.addEventListener("click", () => {
      setIsAnimation(true);
    });

    /** Tính toán 4 vector góc nhìn giới hạn (Theo trục YZ và trục XZ)
     * Tập hợp các vector nằm trong này sẽ là toàn bộ góc nhìn của camera trong hình cầu.
     * *near plane : 0.1 mà hình cầu có bán kính 100.
     * => near plane = 100.1 thì không nhìn thấy quả cầu nữa!
     */
    const raycaster = new THREE.Raycaster(); // Tạo raycaster để xác định vị trí chuột
    const mouse = new THREE.Vector2(); // Tạo vector để lưu vị trí chuột

    const mouseClick = (event: MouseEvent) => {
      if (!gl.domElement) {
        return;
      }

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([sphere]);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        setImagePositions((prev) => [...prev, [point.x, point.y, point.z]]);
        console.log("Toạ độ điểm chạm:", point);
      }
    };

    window.addEventListener("click", mouseClick);

    // Cleanup function để giải phóng tài nguyên
    return () => {
      gl.dispose();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // Dừng vòng lặp khi component unmount
      }

      window.removeEventListener("click", mouseClick);
    };
  }, [set]);

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
        {/* <Canvas
          onClick={handleCloseMenu}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ cursor: cursor }}
        >
          {imagePositions.map((position, index) => (
          
          ))}
        </Canvas> */}

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
          className={`${styles.right_menu} ${isMenuVisible ? styles.show : ""}`}
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
        {/* Hộp feedback */}
        <Chat />
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
