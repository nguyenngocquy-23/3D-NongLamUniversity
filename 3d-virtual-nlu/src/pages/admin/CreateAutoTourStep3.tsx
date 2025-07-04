import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { useNavigate } from "react-router-dom";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import VideoMeshComponent from "../../components/admin/VideoMesh";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import GroundHotspotInfo from "../../components/visitor/GroundHotspotInfo";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/createTourStep2.module.css";
import {
  HotspotNavigation,
  HotspotInformation,
  HotspotModel,
  HotspotMedia,
} from "../../redux/slices/HotspotSlice";
import * as THREE from "three";
import { FaAngleLeft } from "react-icons/fa6";
import { CREATE_TOUR_STEPS } from "../../features/CreateTour";
import Swal from "sweetalert2";
import { selectPanorama } from "../../redux/slices/PanoramaSlice";
import { nextStep, prevStep } from "../../redux/slices/StepSlice";
import { fetchMasterNodes } from "../../redux/slices/DataSlice";
import gsap from "gsap";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { API_URLS } from "../../env";
import { Environment } from "@react-three/drei";
import MiniMap from "../../components/Minimap";
import CamControls from "../../components/visitor/CamControls";
import { useAutoTour } from "../../hooks/useAutoTour";

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
    autoRotate = 0,
    speedRotate = 1,
  } = currentPanorama?.config ?? {};

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
    console.log("Running tour step:", targetNodeId, hotspotTargetPosition);
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const control = controlsRef.current;
    const originalFov = camera.fov;
    const zoomTarget = 45; // Hiệu ứng zoom in đến vị trí mong muốn.

    const [x, y, z] = hotspotTargetPosition;

    // lookAtHotspot([x, y, z]);
    // === Bước 2: Zoom vào
    handleSelectNode(targetNodeId);

    gsap.to(camera, {
      fov: zoomTarget,
      duration: 1.0,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.updateProjectionMatrix();
      },
      onComplete: () => {
        gsap.to(camera, {
          fov: originalFov,
          duration: 0.2,
          delay: 0.1,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.updateProjectionMatrix();
          },
          onComplete: () => {
            camera.updateProjectionMatrix();
            control.update(); // đảm bảo OrbitControls cập nhật
          },
        });
      },
    });
  };

  const lookAtHotspot = (hotspotTargetPosition: [number, number, number]) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const controls = controlsRef.current;

    /**
     * Toạ độ hoá vector (Dùng cho việc chỉ hướng) cho 2 điểm hotspot target và center
     * + Lưu ý: hotspot target sẽ nằm dưới mặt đất -> ta cần lấy ngang tầm mắt tức là y =0.
     */
    const hotspotVec = new THREE.Vector3(
      hotspotTargetPosition[0],
      0,
      hotspotTargetPosition[2]
    );
    const center = new THREE.Vector3(0, 0, 0);

    const dir = hotspotVec.clone().sub(center); // Vector hướng từ tâm -> hotspot

    const spherical = new THREE.Spherical();
    spherical.setFromVector3(dir);

    // PHI : Góc xoay theo mặt phẳng XZ / THETA: Góc xoay theo trục Y
    controls.setAzimuthalAngle(spherical.theta + Math.PI); // quay 180 độ
    controls.setPolarAngle(Math.PI - spherical.phi); // góc xoay dọc

    controls.update();
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
    const textInfo = currentPanorama?.config.description;

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
    });
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return; // bỏ qua lần mount đầu tiên (Strict Mode sẽ gọi 2 lần)
    }

    readText();
  }, [currentPanorama]);

  // const handlePublishTour = async () => {
  //   const { panoramaList, spaceId } = panoramas;

  //   if (!spaceId || panoramaList.length === 0) {
  //     alert("spaceId bị null hay panorama không chứa giá trị..");
  //     return;
  //   }
  //   try {
  //     //Step1: Mapping dữ liệu Redux với Request bên backend.
  //     const payload = TourNodeRequestMapper.mapOneNodeCreateRequest(
  //       panoramaList,
  //       hotspots.hotspotList,
  //       userId
  //     );

  //     // Step2: Gửi lên backend
  //     const response = await axios.post(API_URLS.ADMIN_CREATE_NODES, payload);
  //     if (response.data?.statusCode === 1000) {
  //       Swal.fire({
  //         icon: "success",
  //         title: "Thành công",
  //         text: "Xuất bản thành công",
  //       }).then(() => {
  //         dispatch(nextStep());
  //       });
  //     } else {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Thất bại",
  //         text:
  //           "Xuất bản thất bại: " +
  //           (response.data?.message || "Không rõ lý do"),
  //       });
  //     }
  //   } catch (error) {
  //     console.log("Lỗi khi xuất bản: ", error);
  //   }
  // };

  const [cameraAngle, setCameraAngle] = useState(0);

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
            yawOffsetCurrent={currentPanorama?.config.yawOffset ?? 0}
            lightIntensity={lightIntensity}
          />
          <CamControls
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            autoRotate={true}
            autoRotateSpeed={0.2}
          />
        </Canvas>
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
        </div>
        <button
          className={styles.publish_tour_button}
          // onClick={handlePublishTour}
        >
          Xuất bản
        </button>
      </div>
    </>
  );
};

export default CreateAutoTourStep3;
