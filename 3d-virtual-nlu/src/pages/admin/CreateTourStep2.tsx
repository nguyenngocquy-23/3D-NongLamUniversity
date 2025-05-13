import * as THREE from "three";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/createTourStep2.module.css";
import { FaAngleRight, FaPlus } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import { selectPanorama } from "../../redux/slices/PanoramaSlice";
import RightMenuCreateTour from "../../components/admin/RightMenuCT";
import TaskContainerCT from "../../components/admin/TaskContainerCT";
import { useSequentialTasks } from "../../hooks/useSequentialTasks";
import Task2 from "../../components/admin/taskCreateTourList/Task2BasicConfig";
import Task1 from "../../components/admin/taskCreateTourList/Task1DisplayInfo";
import Task3 from "../../components/admin/taskCreateTourList/Task3AddHotspot";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import PointMedia from "../../components/admin/PointMedia";
import { useRaycaster } from "../../hooks/useRaycaster";
import TourScene from "../../components/visitor/TourScene";
import CamControls from "../../components/visitor/CamControls";
import {
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  addNavigationHotspot,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
  HotspotType,
} from "../../redux/slices/HotspotSlice";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import VideoMeshComponent from "../../components/admin/VideoMesh";

const CreateTourStep2 = () => {
  /**
   * Xử lý toggle hiển thị menu - start
   */
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleOpenMenu = () => {
    if (isMenuVisible) {
    }
    setIsMenuVisible((preState) => !preState);
  };

  /**
   * Xử lý toggle hiển thị menu - end
   */

  const user = useSelector((state: RootState) => state.auth.user);

  const spaceId = useSelector((state: RootState) => state.panoramas.spaceId);
  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const sphereRef = useRef<THREE.Mesh | null>(null);

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

  // Phần mình đang sửa. ------------------------START.

  /**
   * Khởi tạo sphereRef: sphere ban đầu của hình cầu.
   */
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null); //test

  /**
   * TEST CHO VIỆC THÊM HOTSPOT TYPE.
   * => Task3 trả về type.
   */
  const [currentHotspotType, setCurrentHotspotType] =
    useState<HotspotType | null>(null);

  const defaultIconIds: Record<HotspotType, number> = {
    1: 1,
    2: 2,
    3: 1,
    4: 1,
  };

  const RADIUS = 100;

  // Lấy dữ liệu được thiết lập sẵn dưới Redux lên.

  const dispatch = useDispatch();

  const hotspotModels = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotModel => hotspot.type === 4
    )
  );

  const hotspots = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotNavigation => hotspot.type === 1
    )
  );

  const hotspotMedias = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotMedia => hotspot.type === 3
    )
  );

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

  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
  };

  /**
   *
   * @param e : Sự kiện click chuột từ frontend
   * @param point : Vector3d: x, y, z
   */
  const handleScenePointerDown = (
    e: ThreeEvent<PointerEvent>,
    point: THREE.Vector3
  ) => {
    if (!currentHotspotType || !assignable) {
      return;
    }

    const newPoints = [...currentPoints, [point.x, point.y, point.z]] as [
      number,
      number,
      number
    ][];
    if (currentHotspotType == 3) {
      setCurrentPoints(newPoints);
      console.log("newPoints.length", newPoints.length);
      console.log("newPoints", newPoints);
    }

    let basicProps: {
      nodeId: string;
      iconId: number;
      positionX: number;
      positionY: number;
      positionZ: number;
      scale: number;
      pitchX: number;
      yawY: number;
      rollZ: number;
    } | null = null;

    if ([1, 2, 4].includes(currentHotspotType)) {
      basicProps = {
        nodeId: currentPanorama?.id ?? "",
        iconId: defaultIconIds[currentHotspotType],
        positionX: point.x,
        positionY: point.y,
        positionZ: point.z,
        scale: 1,
        pitchX: 0,
        yawY: 0,
        rollZ: 0,
      };
    }

    // Chỉ xử lý hotspot loại 3 nếu đã có đủ 4 điểm
    if (currentHotspotType === 3 && newPoints.length === 4) {
      basicProps = {
        nodeId: currentPanorama?.id ?? "",
        iconId: defaultIconIds[currentHotspotType],
        positionX: point.x,
        positionY: point.y,
        positionZ: point.z,
        scale: 1,
        pitchX: 0,
        yawY: 0,
        rollZ: 0,
      };

      dispatch(
        addMediaHotspot({
          ...basicProps,
          type: 3,
          mediaType: "",
          mediaUrl: "",
          caption: "",
          cornerPointListJson: JSON.stringify(newPoints),
        })
      );

      setAssignable(false);
      setCurrentHotspotType(null);
      setCurrentPoints([]); // reset sau khi xử lý xong 4 điểm
      return;
    }

    switch (currentHotspotType) {
      case 1:
        if (!basicProps) return;
        dispatch(
          addNavigationHotspot({
            ...basicProps,
            type: 1,
            targetNodeId: "",
          })
        );
        break;

      case 2:
        if (!basicProps) return;
        dispatch(
          addInformationHotspot({
            ...basicProps,
            type: 2,
            title: "",
            content: "",
          })
        );
        break;

      case 4:
        if (!basicProps) return;
        dispatch(
          addModelHotspot({
            ...basicProps,
            type: 4,
            modelUrl: "",
            name: "",
            description: "",
            autoRotate: 0,
            colorCode: "",
          })
        );
        break;
    }

    if ([1, 2, 4].includes(currentHotspotType)) {
      setAssignable(false);
      setCurrentHotspotType(null);
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
              hotspotModels={hotspotModels}
              currentPoints={currentPoints} // mesh đang chọn
              setCurrentPoints={setCurrentPoints} // thêm điểm
              assignable={assignable}
              setAssignable={setAssignable}
              chooseCornerMediaPoint={chooseCornerMediaPoint}
              setChooseCornerMediaPoint={setChooseCornerMediaPoint}
              currentHotspotType={currentHotspotType}
              setCurrentHotspotType={setCurrentHotspotType}
            />
          </>
        );
      default:
        return null;
    }
  };

  const tasks = [
    {
      id: 1,
      title: "Thông tin hiển thị",
    },
    {
      id: 2,
      title: "Thông số cơ bản",
    },
    {
      id: 3,
      title: "Thiết lập điểm tương tác",
    },
  ];

  const {
    openTaskIndex,
    completedTaskIds,
    unlockedTaskIds,
    handleOpenTask,
    handleSaveTask,
    reset,
  } = useSequentialTasks(tasks.length);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

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
            onPointerDown={handleScenePointerDown}
            lightIntensity={lightIntensity}
          />
          <CamControls
            targetPosition={targetPosition}
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            autoRotate={autoRotate === 1 ? true : false}
            autoRotateSpeed={speedRotate}
          />
          {hotspots
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <GroundHotspot
                key={hotspot.id}
                position={[
                  hotspot.positionX,
                  hotspot.positionY,
                  hotspot.positionZ,
                ]}
                idHotspot={hotspot.id}
                setHoveredHotspot={setHoveredHotspot}
                nodeId={hotspot.nodeId}
                type="floor"
              />
            ))}
          {hotspotModels
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot, index) => (
              <GroundHotspotModel
                key={index}
                position={[
                  hotspot.positionX,
                  hotspot.positionY,
                  hotspot.positionZ,
                ]}
                setHoveredHotspot={setHoveredHotspot}
                modelUrl={hotspot.modelUrl}
              />
            ))}
          {hotspotMedias
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot, index) => (
              <VideoMeshComponent
                key={index}
                cornerPoints={
                  JSON.parse(hotspot.cornerPointListJson) as [
                    number,
                    number,
                    number
                  ][]
                }
                currentVideoUrl={hotspot.mediaUrl}
              />
            ))}

          {currentPoints.map((point, index) => (
            <PointMedia key={`p-${index}`} position={point} />
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

        {/* Header chứa logo + close */}
        <div className={styles.header_tour}>
          <div className={styles.thumbnailsBox}>
            {panoramaList.map((item) => (
              <div key={item.id} className={styles.node}>
                <div
                  className={` ${styles.nodeView}  ${
                    item.id === currentSelectId ? styles.nodeSelected : ""
                  }`}
                  onClick={() => handleSelectNode(item.id)}
                >
                  <img
                    src={item.url}
                    alt={item.config.name}
                    className={styles.thumbnailImg}
                  />
                </div>
                <span>{item.config.name}</span>
              </div>
            ))}

            <div className={styles.add_node_button}>
              <FaPlus />
            </div>
          </div>
          <div className={styles.toggleRightMenu}>
            <IoMdMenu className={styles.show_menu} onClick={handleOpenMenu} />
          </div>
        </div>

        {/* Hiển thị menu bên phải.*/}

        {isMenuVisible && (
          <div className={`${styles.rightMenu} ${styles.show}`}>
            <div className={styles.rightTitle}>
              <FaAngleRight
                className={styles.showMenu}
                onClick={handleOpenMenu}
              />
              <h2>Cấu hình</h2>
            </div>

            <RightMenuCreateTour
              tasks={tasks}
              openTaskIndex={openTaskIndex}
              completedTaskIds={completedTaskIds}
              unlockedTaskIds={unlockedTaskIds}
              onTaskClick={handleOpenTask}
            />
          </div>
        )}
        {openTaskIndex !== null && (
          <TaskContainerCT
            id={openTaskIndex}
            name={tasks.find((t) => t.id === openTaskIndex)?.title || ""}
            onSave={() => handleSaveTask(openTaskIndex)}
          >
            {getTaskContentById(openTaskIndex)}
          </TaskContainerCT>
        )}
      </div>
    </>
  );
};

export default CreateTourStep2;
