import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/createTourStep2.module.css";
import * as THREE from "three";
import { FaAngleLeft } from "react-icons/fa6";
import { CREATE_TOUR_STEPS } from "../../features/CreateTour";
import Swal from "sweetalert2";
import { selectPanorama } from "../../redux/slices/PanoramaSlice";
import { nextStep, prevStep } from "../../redux/slices/StepSlice";
import gsap from "gsap";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { API_URLS } from "../../env";
import { Environment } from "@react-three/drei";
import CamControls from "../../components/visitor/CamControls";
import { useAutoTour } from "../../hooks/useAutoTour";
import {
  ApiResponse,
  CloudinaryUploadResp,
} from "../../components/admin/UploadFile";

const CreateAutoTourStep3: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null); //OrbitControls

  const dispatch = useDispatch<AppDispatch>();
  const panoramas = useSelector((state: RootState) => state.panoramas);
  const hotspots = useSelector((state: RootState) => state.hotspots);
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const { autoPanoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  // Panorama hiện tại.
  const currentPanorama = autoPanoramaList.find(
    (pano) => pano.id === currentSelectId
  );
  const currentStep = useSelector((state: RootState) => state.step.currentStep);

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  ); // Giữ lại đối tượng

  const [soundBackground, setSoundBackground] = useState("");

  const [cursor, setCursor] = useState("grab");
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

  const handleHotspotNavigate = (
    targetNodeId: string,
    hotspotTargetPosition: [number, number, number]
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;

    const [x, y, z] = hotspotTargetPosition;

    handleSelectNode(targetNodeId);
  };

  const { startAutoTour, stopAutoTour } = useAutoTour(
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

  const uploadToCloud = async (soundUrl: string) => {
    const formData = new FormData();
    formData.append("file", soundUrl);
    const response = await axios.post<ApiResponse<CloudinaryUploadResp>>(
      API_URLS.UPLOAD_CLOUD,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data.url || "";
  };

  const handlePublishAutoTour = async () => {
    const { autoPanoramaList } = panoramas;
    const tourName = `${autoPanoramaList[0]?.name || ""} - ${
      autoPanoramaList[autoPanoramaList.length - 1]?.name || ""
    }`;

    // Tạo mảng indexNode
    const indexNodeArray = autoPanoramaList.map((p) => ({
      nodeId: p.id,
      duration: p.duration,
    }));

    // Chuyển thành chuỗi JSON
    const indexNode = JSON.stringify(indexNodeArray);

    if (autoPanoramaList.length === 0) {
      alert("spaceId bị null hay panorama không chứa giá trị..");
      return;
    }

    const soundUrl = await uploadToCloud(autoPanoramaList[0].soundBackground);
    alert("Sound URL:" + soundUrl);

    try {
      const response = await axios.post(API_URLS.ADMIN_CREATE_AUTO_TOUR, {
        userId: userId,
        name: tourName,
        indexNode: indexNode,
        soundBackground: soundUrl,
      });
      if (response.data?.statusCode === 1000) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Xuất bản thành công",
        }).then(() => {
          dispatch(nextStep());
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text:
            "Xuất bản thất bại: " +
            (response.data?.message || "Không rõ lý do"),
        });
      }
    } catch (error) {
      console.log("Lỗi khi xuất bản: ", error);
    }
  };

  return (
    <>
      <div className={styles.previewTour}>
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
            autoRotate={autoRotate}
            autoRotateSpeed={speedRotate}
          />
        </Canvas>
        <audio
          src={autoPanoramaList[0].soundBackground || ""}
          autoPlay
          loop
          controls // <-- có thể bỏ nếu bạn không muốn người dùng điều khiển
        />
        {/* Header chứa back */}
        <div className={styles.header_tour} style={{ height: "50px" }}>
          <div className={styles.header_tour_left}>
            <FaAngleLeft
              className={styles.back_btn}
              onClick={() => {
                handleBackStep3();
              }}
            />
            <span>{CREATE_TOUR_STEPS[currentStep - 1].name}</span>
          </div>
          <span className={styles.number_step}>{currentStep}</span>
          <button
            className={styles.publish_tour_button}
            onClick={handlePublishAutoTour}
          >
            Xuất bản
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateAutoTourStep3;
