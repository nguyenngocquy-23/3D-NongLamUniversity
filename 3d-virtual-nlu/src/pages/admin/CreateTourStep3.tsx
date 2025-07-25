import React, { useRef, useState } from "react";
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
import {
  getFilteredHotspotInformationInList,
  getFilteredHotspotMediaInList,
  getFilteredHotspotModelInList,
  getFilteredHotspotNavigationInList,
} from "../../redux/slices/Selectors";
import { useImageCache } from "../../contexts/ImageCacheContext";

const CreateTourStep3: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null); //OrbitControls

  const imageRef = useImageCache(); // Sử dụng trong Ram.

  const dispatch = useDispatch<AppDispatch>();
  const panoramas = useSelector((state: RootState) => state.panoramas);
  const hotspots = useSelector((state: RootState) => state.hotspots);
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  // Panorama hiện tại.
  const currentPanorama = panoramaList.find(
    (pano) => pano.id === currentSelectId
  );
  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  const hotspotNavigations = useSelector(getFilteredHotspotNavigationInList);
  const hotspotInfos = useSelector(getFilteredHotspotInformationInList);
  const hotspotModels = useSelector(getFilteredHotspotModelInList);
  const hotspotMedias = useSelector(getFilteredHotspotMediaInList);

  const navigate = useNavigate();
  const [isTextureReady, setIsTextureReady] = useState(false);
  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor
  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null); //test

  const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null); //test

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  /**
   * Lấy URL panorama hiện tại - hoặc dùng mặc định.
   */
  const currentPanoramaUrl =
    imageRef.current[currentPanorama?.url ?? ""]?.objectUrl ??
    currentPanorama?.url ??
    "/khoa.jpg";

  const {
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    lightIntensity = 1,
    brightness = 0,
    contrast = 1,
    saturation = 1.2,
    grayscale = 0,
    exposure = 1,
  } = currentPanorama?.config ?? {};

  const cameraPosition: [number, number, number] = [
    positionX,
    positionY,
    positionZ,
  ];

  if (!hotspotNavigations && !hotspotInfos && !hotspotModels && !hotspotMedias)
    return;

  const handleSelectNode = (id: string) => {
    setIsTextureReady(false);
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
    const control = controlsRef.current;
    const originalFov = camera.fov;
    const zoomTarget = 45; // Hiệu ứng zoom in đến vị trí mong muốn.

    const [x, y, z] = hotspotTargetPosition;

    handleSelectNode(targetNodeId);
  };

  // const lookAtHotspot = (hotspotTargetPosition: [number, number, number]) => {
  //   if (!cameraRef.current || !controlsRef.current) return;

  //   const controls = controlsRef.current;

  //   /**
  //    * Toạ độ hoá vector (Dùng cho việc chỉ hướng) cho 2 điểm hotspot target và center
  //    * + Lưu ý: hotspot target sẽ nằm dưới mặt đất -> ta cần lấy ngang tầm mắt tức là y =0.
  //    */
  //   const hotspotVec = new THREE.Vector3(
  //     hotspotTargetPosition[0],
  //     0,
  //     hotspotTargetPosition[2]
  //   );
  //   const center = new THREE.Vector3(0, 0, 0);

  //   const dir = hotspotVec.clone().sub(center); // Vector hướng từ tâm -> hotspot

  //   const spherical = new THREE.Spherical();
  //   spherical.setFromVector3(dir);

  //   // PHI : Góc xoay theo mặt phẳng XZ / THETA: Góc xoay theo trục Y
  //   controls.setAzimuthalAngle(spherical.theta + Math.PI); // quay 180 độ
  //   controls.setPolarAngle(Math.PI - spherical.phi); // góc xoay dọc

  //   controls.update();
  // };

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
      const response = await axios.post(API_URLS.ADMIN_CREATE_NODES, payload);
      if (response.data?.statusCode === 1000) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Xuất bản thành công",
        }).then(() => {
          dispatch(nextStep());
        });

        //Dọn RAM ảnh cũ:
        Object.values(imageRef.current).forEach((entry) => {
          URL.revokeObjectURL(entry.objectUrl);
        });
        imageRef.current = {};
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
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            grayscale={grayscale}
            exposure={exposure}
            onTextureReady={() => setIsTextureReady(true)}
          />
          <CamControls
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            autoRotate={false}
            autoRotateSpeed={0}
          />
          {isTextureReady &&
            hotspotNavigations
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
          {isTextureReady &&
            hotspotInfos
              .filter((hotspot) => hotspot.nodeId === currentSelectId)
              .map((hotspot) => (
                <GroundHotspotInfo key={hotspot.id} hotspotInfo={hotspot} />
              ))}
          {isTextureReady &&
            hotspotModels
              .filter((hotspot) => hotspot.nodeId === currentSelectId)
              .map((hotspot) => (
                <GroundHotspotModel
                  key={hotspot.id}
                  setHoveredHotspot={setHoveredHotspot}
                  hotspotModel={hotspot}
                />
              ))}

          {isTextureReady &&
            hotspotMedias
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
                    points={`${point[0]},${point[1]} ${
                      currentPoints[i + 1][0]
                    },${currentPoints[i + 1][1]}`}
                    color="cyan"
                  />
                );
              return null;
            })}

          {currentPanorama && (
            <MiniMap
              currentPanorama={currentPanorama}
              angleCurrent={cameraAngle}
              locked={true}
            />
          )}
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
