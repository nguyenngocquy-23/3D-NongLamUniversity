import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { useNavigate } from "react-router-dom";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import PointMedia from "../../components/admin/PointMedia";
import VideoMeshComponent from "../../components/admin/VideoMesh";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import CamControls from "../../components/visitor/CamControls";
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

const CreateTourStep3: React.FC = () => {
  const panoramas = useSelector((state: RootState) => state.panoramas);
  const hotspots = useSelector((state: RootState) => state.hotspots);
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const navigate = useNavigate();

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const currentStep = useSelector((state: RootState) => state.step.currentStep);

  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null); //OrbitControls

  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);

  const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null); //test
  const [assignable, setAssignable] = useState(false);
  const [chooseCornerMediaPoint, setChooseCornerMediaPoint] = useState(false);

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  // Panorama hiện tại.
  const currentPanorama = panoramaList.find(
    (pano) => pano.id === currentSelectId
  );

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
    speedRotate = 0,
  } = currentPanorama?.config ?? {};

  const cameraPosition: [number, number, number] = [
    positionX,
    positionY,
    positionZ,
  ];

  const dispatch = useDispatch<AppDispatch>();

  const hotspotNavigations = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotNavigation => hotspot.type === 1
    )
  );
  const hotspotInfos = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotInformation => hotspot.type === 2
    )
  );
  const hotspotModels = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotModel => hotspot.type === 4
    )
  );

  const hotspotMedias = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotMedia => hotspot.type === 3
    )
  );

  if(!hotspotNavigations && !hotspotInfos && !hotspotModels && !hotspotMedias) return;

  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
  };

  const handleHotspotNavigate = (
    targetNodeId: string,
    hotspotTargetPosition: [number, number, number]
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    console.log("Text step2" + camera);
    const control = controlsRef.current;
    const originalFov = camera.fov;
    const zoomTarget = 45; // Có thể điều chỉnh FOV này tùy theo yêu cầu

    const [x, y, z] = hotspotTargetPosition;

    // === Bước 1: Tạo điểm cần nhìn đến (hotspot)
    const targetLookAt = new THREE.Vector3(x, 0, z);

    // === Bước 2: Animation tạm thời "quay" camera bằng cách move lookAt
    const tempTarget = targetLookAt.clone();

    gsap.to(camera.rotation, {
      duration: 0.2,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(tempTarget);
        control.update();
      },
      onComplete: () => {
        gsap.to(camera, {
          fov: zoomTarget,
          duration: 1.0,
          ease: "power2.inOut",
          onUpdate: () => {
            handleSelectNode(targetNodeId);
            camera.updateProjectionMatrix();
          },
          onComplete: () => {
            camera.fov = originalFov;
            camera.lookAt(0, 0, 0); // về
            camera.updateProjectionMatrix();
            control.update();
          },
        });
      },
    });
  };

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

  const handlePublishTour = async () => {
    const { panoramaList, spaceId } = panoramas;

    if (!spaceId || panoramaList.length === 0) {
      alert("spaceId bị null hay panorama không chứa giá trị..");
      return;
    }
    try {
      //Step1: Mapping dữ liệu Redux với Request bên backend.
      const payload = TourNodeRequestMapper.mapOneNodeCreateRequest(
        panoramaList,
        hotspots.hotspotList,
        userId
      );

      // Step2: Gửi lên backend
      const response = await axios.post(
        "http://localhost:8080/api/v1/admin/node/insert",
        payload
      );
      if (response.data?.statusCode === 1000) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Xuất bản thành công",
        }).then(() => {
          dispatch(nextStep());
          dispatch(fetchMasterNodes());
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
          <UpdateCameraOnResize />
          <TourScene
            nodeId={currentSelectId ?? ""}
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            textureCurrent={currentPanoramaUrl ?? "/khoa.jpg"}
            lightIntensity={lightIntensity}
          />
          <CamControls
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            autoRotate={autoRotate === 1 ? true : false}
            autoRotateSpeed={speedRotate}
          />
          {hotspotNavigations
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <GroundHotspot
                key={hotspot.id}
                onNavigate={(targetNodeId, cameraTargetPosition) =>
                  handleHotspotNavigate(targetNodeId, cameraTargetPosition)
                }
                hotspotNavigation={hotspot}
              />
            ))}
          {hotspotInfos
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <GroundHotspotInfo key={hotspot.id} hotspotInfo={hotspot} />
            ))}
          {hotspotModels
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <GroundHotspotModel
                key={hotspot.id}
                setHoveredHotspot={setHoveredHotspot}
                hotspotModel={hotspot}
              />
            ))}

          {hotspotMedias
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <VideoMeshComponent key={hotspot.id} hotspotMedia={hotspot} />
            ))}
          {currentPoints.length > 1 &&
            currentPoints.map((point, i) => {
              if (i < currentPoints.length - 1)
                return (
                  <line
                    key={i}
                    points={[point, currentPoints[i + 1]]}
                    color="cyan"
                  />
                );
              return null;
            })}
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
          onClick={handlePublishTour}
        >
          Xuất bản
        </button>
      </div>
    </>
  );
};

export default CreateTourStep3;
