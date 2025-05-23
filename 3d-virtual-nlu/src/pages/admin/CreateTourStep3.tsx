import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
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
  clearHotspot,
} from "../../redux/slices/HotspotSlice";
import * as THREE from "three";
import { RADIUS } from "./CreateTourStep2";
import { FaAngleLeft, FaPlus } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { CREATE_TOUR_STEPS } from "../../features/CreateTour";
import Swal from "sweetalert2";
import { clearPanorama } from "../../redux/slices/PanoramaSlice";
import { nextStep, prevStep } from "../../redux/slices/StepSlice";

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

  const dispatch = useDispatch();

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
            radius={RADIUS}
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
                position={[
                  hotspot.positionX,
                  hotspot.positionY,
                  hotspot.positionZ,
                ]}
                // idHotspot={hotspot.id}
                setHoveredHotspot={setHoveredHotspot}
                nodeId={hotspot.nodeId}
                type="floor"
                hotspotNavigation={hotspot}
              />
            ))}
          {hotspotInfos
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <GroundHotspotInfo
                key={hotspot.id}
                setHoveredHotspot={setHoveredHotspot}
                hotspotInfo={hotspot}
              />
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
            .map((hotspot, index) => (
              <VideoMeshComponent key={index} hotspotMedia={hotspot} />
            ))}

          {currentPoints.map((point, index) => (
            <PointMedia key={`p-${index}`} position={point} />
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
