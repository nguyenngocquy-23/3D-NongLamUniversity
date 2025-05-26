import TourScene from "../../components/visitor/TourScene";
import { Canvas } from "@react-three/fiber";
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
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store.ts";
import {
  fetchDefaultNodes,
  fetchIcons,
  fetchMasterNodes,
} from "../../redux/slices/DataSlice.ts";
import Waiting from "../../components/Waiting.tsx";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel.tsx";
import {
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice.ts";
import VideoMeshComponent from "../../components/admin/VideoMesh.tsx";
import GroundHotspotInfo from "../../components/visitor/GroundHotspotInfo.tsx";

/**
 * Nhằm mục đích tái sử dụng Virtual Tour.
 * => Nhận vào 1 texture url (Test)
 * Chúng ta sẽ cần nhận vào 1 danh sách thông tin url để hiển thị
 * Virtual Tour sẽ nằm ở 2 dạng chính:
 * 1. Hiển thị khi thêm tour mới.
 * 2. Hiển thị màn hình cho phép người dùng di chuyển tại giao diện.
 */
const VirtualTour = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchMasterNodes());
    dispatch(fetchIcons());
    // dispatch(fetchDefaultNodes());
  }, [dispatch]);

  const stored = localStorage.getItem("defaultNode");
  const defaultNode = stored ? JSON.parse(stored) : null;
  const hotspotModels = (defaultNode?.modelHotspots as HotspotModel[]) || [];
  const hotspotMedias = (defaultNode?.mediaHotspots as HotspotMedia[]) || [];
  const hotspotNavigations =
    (defaultNode?.navHotspots as HotspotNavigation[]) || [];
  const hotspotInformations =
    (defaultNode?.infoHotspots as HotspotInformation[]) || [];
  console.log("hotspotInformations..", hotspotInformations);

  if (
    !hotspotModels ||
    !hotspotMedias ||
    !hotspotNavigations ||
    !hotspotInformations
  ) {
    return null;
  }

  // const defaultNode = sessionStorage.getItem("defaultNode");
  // let defaultNode = null;
  // if (defaultNodeJson) defaultNode = JSON.parse(defaultNodeJson);

  const [isRotation, setIsRotation] = useState(defaultNode.autoRotate || true);

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  ); // Giữ lại đối tượng

  /**
   * Giải pháp tạm thời cho việc reload mới scroll duoc
   * Tự động reload trang khi render và ẩn sau lớp Waiting
   */
  // useEffect(() => {
  //   const alreadyReloaded = sessionStorage.getItem("reloaded");

  //   if (!alreadyReloaded) {
  //     console.log("🔄 Reloading page...");
  //     sessionStorage.setItem("reloaded", "true");
  //     window.location.reload();
  //   }
  // }, []);

  /**
   * Lớp chờ để ẩn các tiến trình render
   * Tạo cảm giác loading cho người dùng
   */
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    setIsWaiting(true);
    const timeout = setTimeout(() => {
      setIsWaiting(false); // ẩn trang chờ
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

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
  // const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null);
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
  const [isOpenInfo, setIsOpenInfo] = useState(true);

  const toggleInformation = () => {
    const divInfo = document.querySelector<HTMLElement>(`.${styles.infoBox}`);
    if (!divInfo) return;

    if (isOpenInfo) {
      divInfo.style.display = "none";
      divInfo.style.bottom = "-100px";
    } else {
      divInfo.style.display = "block";
      divInfo.style.bottom = "50px";
    }
    setIsOpenInfo(!isOpenInfo);
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
  }, [isMuted]);

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  }, []);

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
        <TourScene
          radius={radius}
          sphereRef={sphereRef}
          textureCurrent={defaultNode.url ?? "/khoa.jpg"}
          // textureCurrent={defaultNode.url ?? "/khoa.jpg"}
          lightIntensity={defaultNode.lightIntensity}
        />
        <CamControls
          targetPosition={targetPosition}
          sphereRef={sphereRef}
          autoRotate={isRotation}
          autoRotateSpeed={defaultNode.speedRotate}
        />
        {/* {hotspots.map((hotspot) => (
          <GroundHotspotModel
            key={hotspot.id}
            position={hotspot.position}
            modelUrl={hotspot.}
            // type={hotspot.type}
            setHoveredHotspot={setHoveredHotspot}
          />
        ))}  */}
        {hotspotInformations.map((hotspot, index) => (
          <GroundHotspotInfo key={index} hotspotInfo={hotspot} />
        ))}
        {hotspotModels.map((hotspot, index) => (
          <GroundHotspotModel key={index} hotspotModel={hotspot} />
        ))}
        {hotspotMedias.map((hotspot, index) => (
          <VideoMeshComponent key={index} hotspotMedia={hotspot} />
        ))}
      </Canvas>
      {/* Header chứa logo + close */}
      <div className={styles.headerTour}>
        <h2>NLU360</h2>
        <IoIosCloseCircle className={styles.close_btn} onClick={handleClose} />
      </div>
      {/* Menu bên trái */}
      <LeftMenuTour isMenuVisible={isMenuVisible} />
      {/* Hộp feedback */}
      <Chat nodeId={defaultNode.id} />
      {/* <Chat nodeId={defaultNode.id} /> */}
      {/* Footer chứa các tính năng */}
      <FooterTour
        isRotation={isRotation}
        setIsRotation={setIsRotation}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        toggleInformation={toggleInformation}
        toggleFullscreen={toggleFullscreen}
        toggleMute={toggleMute}
      />
      {/* Hộp thông tin */}
      <div className={styles.infoBox} onClick={toggleInformation}>
        Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông
        Lâm Thành phố Hồ Chí Minh
      </div>{" "}
      {/* <StatsPanel className={styles.statsPanel} /> */}
      {/* Màn hình laoding */}
      {isWaiting ? <Waiting /> : ""}
    </div>
  );
};

export default VirtualTour;
