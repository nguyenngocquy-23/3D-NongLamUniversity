import React, { useRef, useState, useMemo, useEffect } from "react";
import styles from "../../styles/managerTourDetail.module.css";
import * as THREE from "three";
import {
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
  FaAngleUp,
} from "react-icons/fa6";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store.ts";
import { NodeItem } from "./NodeItem.tsx";
import SearchBar from "../../features/SearchBar.tsx";
import axios from "axios";
import { API_URLS } from "../../env.ts";
import { Perf } from "r3f-perf";
import {
  addPanorama,
  addPanoramasFromResponse,
  clearPanorama,
  PanoramaItem,
  selectPanorama,
} from "../../redux/slices/PanoramaSlice.ts";
import {
  addHotspotsFromResponse,
  BaseHotspot,
  clearHotspot,
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice.ts";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper.ts";
import { IoChevronBack } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { Canvas } from "@react-three/fiber";
import { DEFAULT_ORIGINAL_Z, RADIUS_SPHERE } from "../../utils/Constants.ts";
import { Environment } from "@react-three/drei";
import UpdateCameraOnResize from "../UpdateCameraOnResize.tsx";
import TourScene from "../visitor/TourScene.tsx";
import CamControls from "../visitor/CamControls.tsx";
import GroundHotspot from "../visitor/GroundHotspot.tsx";
import GroundHotspotInfo from "../visitor/GroundHotspotInfo.tsx";
import GroundHotspotModel from "../visitor/GroundHotspotModel.tsx";
import VideoMeshComponent from "./VideoMesh.tsx";
import RightMenuCreateTour from "./RightMenuCT.tsx";
import UpdateHotspot from "./taskCreateTourList/UpdateHotspot.tsx";
import TaskContainerCT from "./TaskContainerCT.tsx";
import { IoMdMenu } from "react-icons/io";
import { tasks } from "../../pages/admin/CreateTourStep2.tsx";
import { useSequentialTasks } from "../../hooks/useSequentialTasks.ts";
import Swal from "sweetalert2";
import Task1 from "./taskCreateTourList/Task1DisplayInfo.tsx";
import Task2 from "./taskCreateTourList/Task2BasicConfig.tsx";
import Task3 from "./taskCreateTourList/Task3AddHotspot.tsx";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import MiniMap from "../Minimap.tsx";
import {
  getFilteredHotspotInformationInList,
  getFilteredHotspotMediaInList,
  getFilteredHotspotModelInList,
  getFilteredHotspotNavigationInList,
} from "../../redux/slices/Selectors.ts";

const ManagerTourDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { nodeId } = useParams();

  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!nodeId) return;

    axios
      .post(API_URLS.GET_FULL_TOUR, {
        nodeId: Number(nodeId),
      })
      .then((resp) => {
        const nodes = resp.data.data;
        dispatch(clearPanorama());
        dispatch(clearHotspot());
        const { panoramaList, hotspotList } =
          TourNodeRequestMapper.mapToPanoramaAndHotspots(nodes);
        dispatch(addPanoramasFromResponse(panoramaList));
        dispatch(addHotspotsFromResponse(hotspotList));
      })
      .catch((err) => {
        console.warn("Lỗi không lấy được node", err);
      });
  }, [nodeId, dispatch]);

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const currentTour = panoramaList.find((p) => p.id == nodeId);
  const currentNode = panoramaList.find((p) => p.id == currentSelectId);

  const panoramasOtherTour = panoramaList.filter(
    (p) => p.config.status === 2 && p.id !== nodeId
  );

  const hotspots = useSelector((state: RootState) => state.hotspots);

  const hotspotNavigations = useSelector(getFilteredHotspotNavigationInList);
  const hotspotInformations = useSelector(getFilteredHotspotInformationInList);
  const hotspotModels = useSelector(getFilteredHotspotModelInList);

  const hotspotMedias = useSelector(getFilteredHotspotMediaInList);
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null);
  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);

  const [viewMode, setViewMode] = useState<number>(1);
  const [isTextureReady, setIsTextureReady] = useState(false);
  const [currentHotspotId, setCurrentHotspotId] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [preTaskIndex, setPreTaskIndex] = useState<number | null>(null);
  const [assignable, setAssignable] = useState(false);
  const [currentHotspotType, setCurrentHotspotType] = useState(1);
  const [validIcon, setValidIcon] = useState(true);
  const [cameraAngle, setCameraAngle] = useState(0);

  const handleOpenMenu = () => {
    setIsMenuVisible((preState) => !preState);
  };
  const handleOnPropsChange = (updatedProps: BaseHotspot) => {
    setBasicProps(updatedProps);
  };

  const { openTaskIndex, handleOpenTask } = useSequentialTasks(tasks.length);

  const handleSelectNode = (id: string) => {
    setIsTextureReady(false);
    dispatch(selectPanorama(id));
    setCurrentHotspotId(null);
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
    if (panoramasOtherTour.some((p) => p.id === targetNodeId)) return;
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const control = controlsRef.current;
    const originalFov = camera.fov;
    const zoomTarget = 45; // Hiệu ứng zoom in đến vị trí mong muốn.

    const [x, y, z] = hotspotTargetPosition;

    lookAtHotspot([x, y, z]);
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

  const handleUpdateTour = async () => {
    if (panoramaList.length === 0) {
      alert("spaceId bị null hay panorama không chứa giá trị..");
      return;
    }
    try {
      //Step1: Mapping dữ liệu Redux với Request bên backend.
      const payload = TourNodeRequestMapper.mapOneNodeUpdateRequest(
        panoramaList,
        hotspots.hotspotList
      );

      // Step2: Gửi lên backend
      const response = await axios.post(API_URLS.ADMIN_UPDATE_NODES, payload);
      if (response.data.data) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thành công",
        }).then(() => {
          // setIsUpdateTour(false);
          // dispatch(fetchMasterNodes());
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text:
            "Cập nhật thất bại: " +
            (response.data?.message || "Không rõ lý do"),
        });
      }
    } catch (error) {
      console.log("Lỗi khi cập nhật: ", error);
    }
  };

  const getTaskContentById = (id: number): React.ReactNode => {
    switch (id) {
      case 1:
        return (
          <>
            <Task1 />
          </>
        );
      case 2:
        return (
          <>
            <Task2 cameraRef={cameraRef} />
          </>
        );
      case 3:
        return (
          <>
            <Task3
              isAssignable={assignable}
              setAssignable={setAssignable}
              setValidIcon={setValidIcon}
              setCurrentHotspotType={setCurrentHotspotType}
              onPropsChange={handleOnPropsChange}
              currentPanorama={currentNode}
              limitNav={true}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (!currentNode) return <p>Đang tải thông tin ...</p>;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IoChevronBack
          className={styles.tour_icon_back}
          onClick={() => navigate(-1)}
        />
        <p className={styles.tour_title}>{currentTour.config.name}</p>
        <div className={styles.tour_mode}>
          <button
            className={`${styles.tour_mode_item}
          
            ${viewMode === 1 ? styles.tour_mode_active : ""}
            
            `}
            onClick={() => {
              if (viewMode !== 1) setViewMode(1);
            }}
          >
            Thông tin
          </button>
          <button
            className={`${styles.tour_mode_item} ${
              viewMode === 2 ? styles.tour_mode_active : ""
            }`}
            onClick={() => {
              if (viewMode !== 2) setViewMode(2);
            }}
          >
            Preview
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {viewMode === 1 ? (
          <div className={styles.preview_tour}>
            <div className={styles.overview}>
              <div className={styles.overview_left}>
                <img
                  src={currentTour.url}
                  alt="anh-khong-gian"
                  className={styles.img}
                />
                <span className={styles.img_custom}>
                  <CiEdit />
                </span>
              </div>

              <div className={styles.overview_right}>
                <div className={styles.overview_information}>
                  <div className={styles.label_information}>Không gian: </div>
                  <div className={styles.content_information}></div>
                </div>
                <div className={styles.overview_information}>
                  <div className={styles.label_information}>Tên Tour: </div>
                  <div className={styles.content_information}>
                    {currentTour.config.name}
                  </div>
                </div>
                <div className={styles.overview_information}>
                  <div className={styles.label_information}>Mã tour: </div>
                </div>
                <div className={styles.overview_information}>
                  <div className={styles.label_information}>Mô tả: </div>
                  <div className={styles.content_information}>
                    {currentTour.config.description}
                  </div>
                </div>
                <div className={styles.overview_information}>
                  <div className={styles.label_information}>Trạng thái: </div>
                  <div className={styles.content_information}>
                    {currentTour.config.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.preview_tour}>
            <Canvas
              camera={{
                fov: 75,
                near: 0.1,
                far: 1000,
                position: [0, 0, DEFAULT_ORIGINAL_Z],
              }}
              className={styles.tourCanvas}
            >
              <Perf />
              <UpdateCameraOnResize />
              <Environment preset="studio" background={false} />
              <axesHelper args={[10]} position={[0, -90, 0]} />
              <TourScene
                radius={RADIUS_SPHERE}
                sphereRef={sphereRef}
                textureCurrent={currentNode.url}
                yawOffsetCurrent={currentNode.config.yawOffset}
                lightIntensity={1}
                onTextureReady={() => setIsTextureReady(true)}
              />
              <CamControls
                controlsRef={controlsRef}
                targetPosition={targetPosition}
                cameraRef={cameraRef}
                sphereRef={sphereRef}
                autoRotate={currentNode.autoRotate === 1 ? true : false}
                autoRotateSpeed={
                  currentNode || currentNode.config.speedRotate == 0
                    ? 0.2
                    : currentNode.config.speedRotate
                }
                onAngleChange={(angle) => {
                  setCameraAngle(angle); // cameraAngle luôn là góc thật tại thời điểm hiện tại (0–360)
                }}
              />
              <MiniMap
                currentPanorama={currentNode}
                angleCurrent={cameraAngle}
                currentTour={nodeId}
              />

              {isTextureReady &&
                hotspotInformations
                  .filter((hotspot) => hotspot.nodeId == currentNode.id)
                  .map((hotspot) => (
                    <GroundHotspotInfo
                      key={hotspot.id}
                      hotspotInfo={hotspot}
                      setCurrentHotspotId={setCurrentHotspotId}
                    />
                  ))}
              {isTextureReady &&
                hotspotNavigations
                  .filter((hotspot) => hotspot.nodeId == currentNode.id)
                  .map((hotspot) => (
                    <GroundHotspot
                      key={hotspot.id}
                      onNavigate={(targetNodeId, cameraTargetPosition) =>
                        handleHotspotNavigate(
                          targetNodeId,
                          cameraTargetPosition
                        )
                      }
                      hotspotNavigation={hotspot}
                      setCurrentHotspotId={setCurrentHotspotId}
                    />
                  ))}
              {isTextureReady &&
                hotspotModels
                  .filter((hotspot) => hotspot.nodeId == currentNode.id)
                  .map((hotspot) => (
                    <GroundHotspotModel
                      key={hotspot.id}
                      hotspotModel={hotspot}
                      setCurrentHotspotId={setCurrentHotspotId}
                    />
                  ))}
              {isTextureReady &&
                hotspotMedias
                  .filter((hotspot) => hotspot.nodeId == currentNode.id)
                  .map((hotspot) => (
                    <VideoMeshComponent
                      key={hotspot.id}
                      hotspotMedia={hotspot}
                      setCurrentHotspotId={setCurrentHotspotId}
                    />
                  ))}
            </Canvas>

            <div className={styles.toggle_right_menu}>
              <IoMdMenu
                className={styles.show_menu}
                onClick={() => handleOpenMenu()}
              />
            </div>

            <AnimatePresence>
              {isMenuVisible && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${styles.rightMenu} `}
                >
                  <div className={styles.rightTitle}>
                    <FaAngleRight
                      className={styles.close_menu_btn}
                      onClick={handleOpenMenu}
                    />
                    <h2>Cấu hình</h2>
                  </div>

                  <RightMenuCreateTour
                    tasks={tasks}
                    openTaskIndex={openTaskIndex}
                    onTaskClick={handleOpenTask}
                    setPreOpenTask={setPreTaskIndex}
                    saveLinkNode={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* tasks */}
            <AnimatePresence>
              {isMenuVisible &&
                openTaskIndex !== null &&
                currentHotspotId === null && (
                  <motion.div
                    initial={{ y: 1000, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 1000, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`${styles.task_container}`}
                  >
                    <TaskContainerCT
                      id={preTaskIndex}
                      name={
                        tasks.find((t) => t.id === preTaskIndex)?.title || ""
                      }
                    >
                      {preTaskIndex
                        ? getTaskContentById(openTaskIndex ?? preTaskIndex)
                        : ""}
                    </TaskContainerCT>
                  </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
              {currentHotspotId !== null && (
                <motion.div
                  initial={{ y: 1000, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 1000, opacity: 0 }}
                  transition={{ duration: 1 }}
                  className={`${styles.update_hotspot_container} `}
                >
                  <UpdateHotspot
                    hotspotId={currentHotspotId}
                    setHotspotId={setCurrentHotspotId}
                    onPropsChange={handleOnPropsChange}
                    limitNav={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
export default ManagerTourDetail;
