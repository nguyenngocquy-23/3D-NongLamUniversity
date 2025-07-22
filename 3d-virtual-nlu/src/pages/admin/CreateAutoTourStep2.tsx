import * as THREE from "three";
import { useState, useEffect, useRef } from "react";
import styles from "../../styles/createTourStep2.module.css";
import { FaAngleLeft, FaBook } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Environment, Line } from "@react-three/drei";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import {
  clearPanorama,
  selectPanorama,
} from "../../redux/slices/PanoramaSlice";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import gsap from "gsap";

import {
  addHotspotPosition,
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  addNavigationHotspot,
  BaseHotspot,
  clearHotspot,
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import VideoMeshComponent from "../../components/admin/VideoMesh";
import GroundHotspotInfo from "../../components/visitor/GroundHotspotInfo";
import {
  goToStep,
  nextStep,
  prevStep,
  resetStep,
} from "../../redux/slices/StepSlice";
import Swal from "sweetalert2";
import { CREATE_TOUR_STEPS } from "../../features/CreateTour";
import MiniMap from "../../components/Minimap";
import { DEFAULT_ORIGINAL_Z, RADIUS_SPHERE } from "../../utils/Constants";
import CamControls from "../../components/visitor/CamControls";
import ConfigAutoTour from "../../components/admin/ConfigAutoTour";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URLS } from "../../env";
import {
  ApiResponse,
  CloudinaryUploadResp,
} from "../../components/admin/UploadFile";
import Waiting from "../../components/Waiting";

const CreateAutoTourStep2 = () => {
  const navigate = useNavigate();
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor
  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);
  const [openConfigTour, setOpenConfigTour] = useState(false);
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null);

  const { tourId } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  useEffect(() => {
    if (tourId) {
      setIsUpdate(true);
      dispatch(goToStep(2));
    }
  }, [tourId]);
  const autoNodes = useSelector((state: RootState) => state.data.autoNodes);

  // const [autoNode, setAutoNode] = useState(null);
  const [autoNode, setAutoNode] = useState<any>(
    autoNodes.find((node) => node.id === tourId)
  );

  useEffect(() => {
    if (tourId && autoNodes.length > 0) {
      const foundNode = autoNodes.find((node) => node.id == tourId);
      setAutoNode(foundNode);
    }
  }, [tourId, autoNodes]);

  useEffect(() => {
    if (autoNode) setStatus(autoNode?.status);
  }, [autoNode]);

  const [status, setStatus] = useState(autoNode?.status); // State để điều khiển cursor

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  /**
   * Khởi tạo sphereRef: sphere ban đầu của hình cầu.
   */

  // ========= REDUX ================

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

  const { autoPanoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  const currentPanorama = autoPanoramaList.find(
    (pano) => pano.id === currentSelectId
  );

  const handleSelectNode = (id: string) => {
    setIsTextureReady(false);
    dispatch(selectPanorama(id));
    setCurrentHotspotId(null);
  };
  // ========= REDUX ================

  /**
   * Lấy URL panorama hiện tại - hoặc dùng mặc định.
   */
  const currentPanoramaUrl =
    currentPanorama?.url ?? `${import.meta.env.BASE_URL}khoa.jpg`;

  const {
    positionX = 0,
    positionY = 0,
    positionZ = DEFAULT_ORIGINAL_Z,
    lightIntensity = 1,
    autoRotate = 1,
    speedRotate = 0.2,
  } = currentPanorama?.config ?? {};

  const cameraPosition: [number, number, number] = [
    positionX,
    positionY,
    positionZ,
  ];

  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);
  const [changeCornerMedia, setChangeCornerMedia] = useState(false);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = false; // tắt khi changeCornerMedia=true
    }
  }, [changeCornerMedia]);

  const handleOnPropsChange = (updatedProps: BaseHotspot) => {
    setBasicProps(updatedProps);
  };

  /**
   * dùng để nhận giá trị trả về từ OptionHotspot.tsx để update cho đúng hotspot
   */
  const [currentHotspotId, setCurrentHotspotId] = useState<string | null>(null);
  const currentStep = useSelector((state: RootState) => state.step.currentStep);

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

    // === Bước 2: Zoom vào
    handleSelectNode(targetNodeId);
  };

  const [cameraAngle, setCameraAngle] = useState(0);

  const [isTextureReady, setIsTextureReady] = useState(false);

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

  const handleUpdateAutoTour = async () => {
    const tourName = `${autoPanoramaList[0]?.name || ""} - ${
      autoPanoramaList[autoPanoramaList.length - 1]?.name || ""
    }`;

    // Tạo mảng indexNode
    const indexNodeArray = autoPanoramaList.map((p: any) => ({
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

    try {
      const response = await axios.post(API_URLS.ADMIN_UPDATE_AUTO_TOUR, {
        autoTourId: tourId,
        name: tourName,
        indexNode: indexNode,
        status: status,
        soundBackground: soundUrl,
      });
      if (response.data?.statusCode === 1000) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thành công",
        }).then(() => {
          navigate(-1);
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

  const [isWaiting, setIsWaiting] = useState(true);
  const [percent, setPercent] = useState(0);
  const [isLoadingDone, setIsLoadingDone] = useState(false);

  useEffect(() => {
    if (
      !hotspotModels ||
      !hotspotMedias ||
      !hotspotNavigations ||
      !hotspotInfos
    ) {
      setIsLoadingDone(false);
      return;
    } else {
      setIsLoadingDone(true);
    }
  }, [hotspotModels, hotspotMedias, hotspotNavigations, hotspotInfos]);

  useEffect(() => {
    let progress = 0;

    const interval = setInterval(() => {
      if (!isLoadingDone) {
        // Loading giả lập, chỉ cho đến 90%
        if (progress < 90) {
          progress += Math.random() * 5; // tăng chậm lại để mượt
          if (progress > 90) progress = 90;
          setPercent(Math.floor(progress));
        }
      } else {
        // Task thật xong, tăng nốt phần còn lại đến 100%
        if (progress < 100) {
          progress += Math.random() * 10;
          if (progress > 100) progress = 100;
          setPercent(Math.floor(progress));
        }

        // Nếu đã 100% thì clear interval
        if (progress >= 100) {
          clearInterval(interval);
          requestAnimationFrame(() => {
            setTimeout(() => setIsWaiting(false), 500);
          });
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isLoadingDone]);

  const handleBackStep2 = () => {
    Swal.fire({
      icon: "question",
      title: "Bạn có chắc chắn muốn quay lại bước trước?",
      text: "Các thay đổi có thể chưa được lưu.",
      showCancelButton: true,
      confirmButtonText: "Quay lại",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(-1);
        dispatch(resetStep());
      }
    });
  };

  return (
    <>
      <div
        className={styles.previewTour}
        style={{ position: `${isUpdate ? "fixed" : "relative"}` }}
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
          onContextMenu={(e) => {
            e.preventDefault();
          }}
        >
          <Environment preset="studio" background={false} />
          <axesHelper args={[10]} position={[0, -90, 0]} />
          <UpdateCameraOnResize />

          <TourScene
            nodeId={currentSelectId ?? ""}
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            textureCurrent={currentPanoramaUrl ?? "/khoa.jpg"}
            yawOffsetCurrent={currentPanorama?.yawOffset ?? 0}
            lightIntensity={lightIntensity}
            onTextureReady={() => setIsTextureReady(true)}
          />

          <CamControls
            targetPosition={targetPosition}
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={speedRotate}
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
                  setCurrentHotspotId={setCurrentHotspotId}
                  hotspotNavigation={hotspot}
                />
              ))}

          {isTextureReady &&
            hotspotInfos
              .filter((hotspot) => hotspot.nodeId === currentSelectId)
              .map((hotspot) => (
                <GroundHotspotInfo
                  key={hotspot.id}
                  setCurrentHotspotId={setCurrentHotspotId}
                  hotspotInfo={hotspot}
                />
              ))}
          {isTextureReady &&
            hotspotModels
              .filter((hotspot) => hotspot.nodeId === currentSelectId)
              .map((hotspot) => (
                <GroundHotspotModel
                  key={hotspot.id}
                  setCurrentHotspotId={setCurrentHotspotId}
                  hotspotModel={hotspot}
                />
              ))}

          {isTextureReady &&
            hotspotMedias
              .filter((hotspot) => hotspot.nodeId === currentSelectId)
              .map((hotspot) => (
                <VideoMeshComponent
                  key={hotspot.id}
                  hotspotMedia={hotspot}
                  setCurrentHotspotId={setCurrentHotspotId}
                />
              ))}

          {currentPoints.length > 1 &&
            currentPoints.map((point, i) => {
              if (i < currentPoints.length - 1)
                return (
                  <Line
                    key={i}
                    points={[point, currentPoints[i + 1]]}
                    color="cyan"
                  />
                );
              return null;
            })}
        </Canvas>

        {/* Header */}
        <div className={styles.header_tour}>
          <div className={styles.header_tour_left}>
            <FaAngleLeft
              className={styles.back_btn}
              onClick={() => {
                isUpdate ? handleBackStep2() : dispatch(resetStep());
              }}
            />
            <span>{CREATE_TOUR_STEPS[currentStep - 1].name}</span>
          </div>
          <span className={styles.number_step}>{currentStep}</span>
          <div className={styles.toggle_next_step_3}>
            <button
              style={{
                marginRight: "1rem",
                textAlign: "center",
                padding: "0.5rem 1rem",
              }}
              onClick={() => {
                isUpdate ? handleUpdateAutoTour() : dispatch(nextStep());
              }}
            >
              {isUpdate ? "Cập nhật" : "Tiếp tục"}
            </button>
          </div>
          {isUpdate && (
            <div className={styles.toggle_status}>
              <span>Trạng thái: </span>
              <button
                style={{
                  marginRight: "1rem",
                  textAlign: "center",
                  padding: "0.5rem 1rem",
                  backgroundColor: status == 0 ? "#f00" : "#0f0",
                }}
                onClick={() => {
                  setStatus(status === 1 ? 0 : 1);
                }}
              >
                {status == 0 ? "Tạm ngưng" : "Hoạt động"}
              </button>
            </div>
          )}
        </div>
        {/* Hộp node */}
        <div className={styles.node_list}>
          {autoPanoramaList.map((pano) => (
            <div
              key={pano.id}
              className={`${styles.node_item} ${
                currentSelectId === pano.id ? styles.active : ""
              }`}
              onClick={() => {
                setOpenConfigTour(pano.id);
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
        {/* Hướng dẫn sử dụng */}
        {!isUpdate && (
          <button className={styles.guide_button} title="Hướng dẫn">
            <FaBook />
          </button>
        )}
        {openConfigTour && (
          <div className={styles.config_tour}>
            <ConfigAutoTour
              setOpenConfigTour={setOpenConfigTour}
              soundBackgroundProp={autoNode?.soundBackground}
            />
          </div>
        )}
        {isWaiting ? <Waiting percent={percent} /> : ""}
      </div>
    </>
  );
};

export default CreateAutoTourStep2;
