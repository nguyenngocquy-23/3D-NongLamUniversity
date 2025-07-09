import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/createTourStep2.module.css";
import * as THREE from "three";
import Swal from "sweetalert2";
import { selectPanorama } from "../../redux/slices/PanoramaSlice";
import { nextStep, prevStep } from "../../redux/slices/StepSlice";
import gsap from "gsap";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { API_URLS } from "../../env";
import { Environment } from "@react-three/drei";
import CamControls from "../../components/visitor/CamControls";
import { useAutoTour } from "../../hooks/useAutoTour";
import { IoIosCloseCircle } from "react-icons/io";
import { FaAngleDoubleRight } from "react-icons/fa";
import FooterTour from "../../components/visitor/FooterTour";
import CommentBox from "../../components/visitor/CommentBox";

const VirtualAutoTour: React.FC = () => {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  const { tourId } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const { autoPanoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  const { autoNodes } = useSelector((state: RootState) => state.data);
  const autoTour = autoNodes.find((tour) => tour.id == tourId);
  // Panorama hiện tại.
  const currentPanorama = autoPanoramaList.find(
    (pano) => pano.id === currentSelectId
  );
  const navigate = useNavigate();

  const [isRotation, setIsRotation] = useState(true);
  const [openNodeList, setOpenNodeList] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh

  const [isComment, setIsComment] = useState(false); // Trạng thái âm thanh

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  ); // Giữ lại đối tượng

  const [accessing, setAccessing] = useState(0);
  const [isOpenInfo, setIsOpenInfo] = useState(true);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
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
    const containerCanvas = document.querySelector(`.${styles.previewTour}`);
    if (!containerCanvas) return;
    if (!isFullscreen) {
      requestFullscreen(containerCanvas); // Chuyển canvas sang fullscreen
      setIsFullscreen(true);
    } else {
      exitFullscreen(); // Thoát fullscreen
      setIsFullscreen(false);
    }
  };

  const toggleInformation = () => {
    const divInfo = document.querySelector<HTMLElement>(`.${styles.info_box}`);
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

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  /**
   * Lấy URL panorama hiện tại - hoặc dùng mặc định.
   */
  const currentPanoramaUrl = currentPanorama?.url ?? "/khoa.jpg";

  const {
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    lightIntensity = 1,
    autoRotate = 1,
    speedRotate = 0.3,
  } = currentPanorama ?? {};

  const cameraPosition: [number, number, number] = [
    positionX,
    positionY,
    positionZ,
  ];
  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
  };

  /**
   *
   * @param targetNodeId : Id node đích cần di chuyển.
   * @param hotspotTargetPosition : Thay thế vị trí camera hướng đến tại vị trí hotspot mục tiêu.
   */

  const handleHotspotNavigate = (
    targetNodeId: string,
    hotspotTargetPosition: [number, number, number]
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;

    const [x, y, z] = hotspotTargetPosition;

    handleSelectNode(targetNodeId);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const { startAutoTour, skipToNext, stopAutoTour } = useAutoTour(
    handleHotspotNavigate,
    autoPanoramaList
  );

  useEffect(() => {
    startAutoTour();

    return () => {
      stopAutoTour();
    };
  }, []);

  const handleBackStep3 = () => {
    Swal.fire({
      icon: "info",
      title: "Tiếp tục chỉnh sửa ở bước 2",
      timer: 2000,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    }).then(() => {
      dispatch(prevStep());
    });
  };

  // Gọi hàm để đọc văn bản khi thay đổi trạng thái âm thanh
  const hasMounted = useRef(false);

  const readText = () => {
    const textInfo = currentPanorama?.description;

    if (!textInfo) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    const speak = (voiceList: any) => {
      const newUtterance = new SpeechSynthesisUtterance(textInfo);
      newUtterance.pitch = 1;
      newUtterance.rate = 1;
      newUtterance.lang = "vi-VN";

      const vietnameseVoice =
        voiceList.find(
          (v: any) =>
            v.lang === "vi-VN" && v.name.toLowerCase().includes("google")
        ) || voiceList.find((v: any) => v.lang === "vi-VN");

      if (vietnameseVoice) {
        newUtterance.voice = vietnameseVoice;
      } else {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Không tìm thấy giọng tiếng Việt",
          text: "Vui lòng cài đặt giọng tiếng Việt cho trình duyệt.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }

      newUtterance.volume = isMuted ? 0 : 1;

      setUtterance(newUtterance);
      speechSynthesis.speak(newUtterance);
    };

    const waitForVoices = (
      callback: (voices: SpeechSynthesisVoice[]) => void
    ) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        callback(voices);
      } else {
        const interval = setInterval(() => {
          const voicesNow = speechSynthesis.getVoices();
          if (voicesNow.length > 0) {
            clearInterval(interval);
            callback(voicesNow);
          }
        }, 100);
      }
    };

    waitForVoices((voices) => {
      speak(voices);
      hasMounted.current = false;
    });
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return; // bỏ qua lần mount đầu tiên (Strict Mode sẽ gọi 2 lần)
    }

    readText();
  }, [currentPanorama]);

  return (
    <>
      <div
        className={styles.previewTour}
        style={{ height: "100vh", width: "100vw" }}
      >
        <Canvas
          camera={{
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000,
            position: cameraPosition,
          }}
          style={{ cursor: cursor }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <Environment preset="studio" background={false} />
          <UpdateCameraOnResize />
          <TourScene
            nodeId={currentSelectId ?? ""}
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            textureCurrent={currentPanoramaUrl ?? "/khoa.jpg"}
            yawOffsetCurrent={currentPanorama?.yawOffset ?? 0}
            lightIntensity={lightIntensity}
          />
          <CamControls
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            autoRotate={isRotation}
            autoRotateSpeed={speedRotate}
          />
        </Canvas>
        <FooterTour
          isRotation={isRotation}
          setIsRotation={setIsRotation}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          toggleInformation={toggleInformation}
          toggleFullscreen={toggleFullscreen}
          toggleMute={toggleMute}
          setIsComment={setIsComment}
          accessing={accessing}
          setOpenNodeList={setOpenNodeList}
        />
        {/* Header chứa back */}
        <div className={styles.header_tour}>
          <h2>{autoTour.name || ""}</h2>
          <IoIosCloseCircle
            className={styles.close_btn}
            onClick={handleClose}
          />
        </div>
        {isComment && user ? (
          <CommentBox
            userId={user.id}
            nodeId={currentPanorama.id}
            setIsComment={setIsComment}
          />
        ) : (
          ""
        )}
        {/* Hộp thông tin */}
        <div className={styles.info_box} onClick={toggleInformation}>
          {currentPanorama.description == ""
            ? "Trống"
            : currentPanorama.description}
        </div>
        {/* Hộp node */}
        {openNodeList && (
          <div className={styles.node_list}>
            {autoPanoramaList.map((pano) => (
              <div
                key={pano.id}
                className={`${styles.node_item} ${
                  currentSelectId === pano.id ? styles.active : ""
                }`}
                onClick={() => {
                  handleSelectNode(pano.id);
                }}
                title={pano.name}
              >
                <img
                  src={pano.url}
                  alt={pano.name}
                  className={styles.node_image}
                />
              </div>
            ))}
          </div>
        )}
        <button className={styles.skip_button} onClick={skipToNext}>
          <FaAngleDoubleRight className={styles.arrow} /> Đi tiếp{" "}
          <FaAngleDoubleRight className={styles.arrow} />
        </button>
      </div>
    </>
  );
};

export default VirtualAutoTour;
