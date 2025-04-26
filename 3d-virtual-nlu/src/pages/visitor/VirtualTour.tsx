import TourScene from "../../components/visitor/TourScene";
import { Canvas, useThree } from "@react-three/fiber";
import styles from "../../styles/virtualTour.module.css";
import CamControls from "../../components/visitor/CamControls";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import Chat from "../../features/Chat.tsx";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";
import FooterTour from "../../components/visitor/FooterTour.tsx";
import LeftMenuTour from "../../components/visitor/LeftMenuTour.tsx";

/**
 *
 * Dành cho việc resize camera và canvas.
 */

const UpdateCameraOnResize = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const handleResize = () => {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      perspectiveCamera.updateProjectionMatrix();
      gl.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [camera, gl]);
  return null;
};

const VideoNode: React.FC = () => {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/video.mp4";
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    video.style.display = "none";

    document.body.appendChild(video);

    video.addEventListener("canplaythrough", () => {
      video.play().catch((err) => console.warn("Video play error:", err));
    });

    const tex = new THREE.VideoTexture(video);
    setTexture(tex); // <- Trigger re-render

    return () => {
      video.pause();
      video.src = "";
      video.remove();
      tex.dispose();
    };
  }, []);

  if (!texture) return null; // Đợi khi đã có texture mới render

  return (
    <mesh position={[0, 0, -50]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[50, 40]} />
      {/* <cylinderGeometry args={[10, 10, 10, 64, 1, true, 0, Math.PI / 2]} /> */}
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
};

const VirtualTour = () => {
  const [isAnimation, setIsAnimation] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  ); // Giữ lại đối tượng utterance

  const navigate = useNavigate();
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [sphereCenter, setSphereCenter] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null); //test

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    console.log("sphereRef.current trong VirtualTour:", sphereRef.current);
  }, [sphereRef.current]);

  const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null); //test

  useEffect(() => {
    let resizeTimer: number;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const radius = 100;

  const [hotspots, setHotspots] = useState<
    { id: number; position: [number, number, number] }[]
  >([]);

  const handleAddHotspot = (position: [number, number, number]) => {
    setHotspots((prev) => [...prev, { id: prev.length + 1, position }]);
  };

  const handledSwitchTexture = (newPosition: [number, number, number]) => {
    if (sphereRef.current) {
      const material = sphereRef.current.material as THREE.MeshBasicMaterial;
      const newTexture = material.map?.image.src.includes("khoa.jpg")
        ? new THREE.TextureLoader().load("thuvien.jpg")
        : new THREE.TextureLoader().load("khoa.jpg");
      newTexture.wrapS = THREE.RepeatWrapping;
      newTexture.repeat.x = -1;

      gsap.to(material, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          material.map = newTexture;
          material.needsUpdate = true;
          gsap.to(material, { opacity: 1, duration: 0.5 });
        },
      });

      //   setTargetPosition(newPosition); //test: Lưu vị trí mới vào state TEST
      //   console.log("Đã đổi texture!");
      // }
      setSphereCenter(newPosition);
      setHotspots((prevHotspots) =>
        prevHotspots.map(({ id, position }) => ({
          id,
          position: [
            position[0] - newPosition[0],
            position[1] - newPosition[1],
            position[2] - newPosition[2],
          ],
        }))
      );
    }
  };

  const handleClose = () => {
    navigate("/");
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

  const toggleFullscreen = () => {
    // const canvas = canvasRef.current;
    // if(!canvas) return;
    const containerCanvas = document.querySelector(`.${styles.tourContainer}`);
    console.log(containerCanvas);
    if (!containerCanvas) return;
    if (!isFullscreen) {
      requestFullscreen(containerCanvas); // Chuyển canvas sang fullscreen
      setIsFullscreen(true);
    } else {
      exitFullscreen(); // Thoát fullscreen
      setIsFullscreen(false);
    }
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
  // Hàm bật/tắt âm thanh
  const toggleMute = () => {
    setIsMuted((preState) => !preState);
  };

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

  const handleMouseEnterMenu = (event: any) => {
    const mouse = event.clientX;

    const threshold = window.innerWidth * 0.05;
    if (mouse < threshold) {
      setIsMenuVisible(true);
    }
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  // Gọi hàm để đọc văn bản khi thay đổi trạng thái âm thanh
  useEffect(() => {
    readText();
  }, [isAnimation, isMuted]);

  return (
    <div className={styles.tourContainer}>
      <Canvas
        camera={{
          fov: 75,
          aspect: windowSize.width / windowSize.height,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0.0000001], // Đặt vị trí mặc định của camera
        }}
        className={styles.tourCanvas}
        onMouseMove={handleMouseEnterMenu}
        onMouseDown={handleCloseMenu}
      >
        <UpdateCameraOnResize />
        <TourScene radius={radius} sphereRef={sphereRef} />
        <CamControls targetPosition={targetPosition} sphereRef={sphereRef} />
        {/* <VideoNode /> */}
        {/* <RaycasterHandler
          sphereRef={sphereRef}
          onAddHotspot={handleAddHotspot}
          hoveredHotspot={hoveredHotspot} //test
          switchTexture={handledSwitchTexture}
        /> */}
        {/* {hotspots.map((hotspot) => (
          <GroundHotspot
            key={hotspot.id}
            position={hotspot.position}
            setHoveredHotspot={setHoveredHotspot}
          />
        ))} */}
      </Canvas>
      {/* Header chứa logo + close */}
      <div className={styles.headerTour}>
        <h2>NLU360</h2>
        <IoIosCloseCircle className={styles.close_btn} onClick={handleClose} />
      </div>
      {/* Menu bên trái */}
      <LeftMenuTour isMenuVisible={isMenuVisible} />
      {/* Hộp feedback */}
      <Chat />
      {/* Footer chứa các tính năng */}
      <FooterTour
        isAnimation={isAnimation}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        toggleInfomation={toggleInfomation}
        toggleFullscreen={toggleFullscreen}
        toggleMute={toggleMute}
      />
      {/* Hộp thông tin */}
      <div className={styles.infoBox} onClick={toggleInfomation}>
        Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông
        Lâm Thành phố Hồ Chí Minh
      </div>{" "}
      {/* <StatsPanel className={styles.statsPanel} /> */}
    </div>
  );
};

export default VirtualTour;
