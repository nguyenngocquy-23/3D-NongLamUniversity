import * as THREE from "three";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/createTourStep2.module.css";
import { FaAngleLeft, FaAngleRight, FaBook, FaPlus } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import {
  clearPanorama,
  selectPanorama,
} from "../../redux/slices/PanoramaSlice";
import RightMenuCreateTour from "../../components/admin/RightMenuCT";
import TaskContainerCT from "../../components/admin/TaskContainerCT";
import { useSequentialTasks } from "../../hooks/useSequentialTasks";
import Task2 from "../../components/admin/taskCreateTourList/Task2BasicConfig";
import Task1 from "../../components/admin/taskCreateTourList/Task1DisplayInfo";
import Task3 from "../../components/admin/taskCreateTourList/Task3AddHotspot";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import CamControls from "../../components/visitor/CamControls";
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
import UpdateHotspot from "../../components/admin/taskCreateTourList/UpdateHotspot";
import GroundHotspotInfo from "../../components/visitor/GroundHotspotInfo";
import { prevStep } from "../../redux/slices/StepSlice";
import Swal from "sweetalert2";
import { CREATE_TOUR_STEPS } from "../../features/CreateTour";
import MiniMap from "../../components/Minimap";
import { DEFAULT_ORIGINAL_Z, RADIUS_SPHERE } from "../../utils/Constants";
import { Timer } from "three/examples/jsm/Addons.js";

const CreateTourStep2 = () => {
  /**
   * Xử lý toggle hiển thị menu - start
   */
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleOpenMenu = () => {
    setIsMenuVisible((preState) => !preState);
  };

  /**
   * Xử lý toggle hiển thị menu - end
   */
  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null); //OrbitControls

  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);

  const [assignable, setAssignable] = useState(false);
  const [chooseCornerMediaPoint, setChooseCornerMediaPoint] = useState(false);

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

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
  const [currentHotspotType, setCurrentHotspotType] = useState(1);

  // Lấy dữ liệu được thiết lập sẵn dưới Redux lên.
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

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  // Panorama hiện tại.
  const currentPanorama = panoramaList.find(
    (pano) => pano.id === currentSelectId
  );

  const hotspotPosition = useSelector(
    (state: RootState) => state.hotspots.hotspotPositions
  );

  /**
   * Lấy URL panorama hiện tại - hoặc dùng mặc định.
   */
  const currentPanoramaUrl = currentPanorama?.url ?? "/khoa.jpg";

  const {
    positionX = 0,
    positionY = 0,
    positionZ = DEFAULT_ORIGINAL_Z,
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
    setCurrentHotspotId(null);
  };

  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);
  const [changeCornerMedia, setChangeCornerMedia] = useState(false);

  useEffect(() => {
    if (controlsRef.current) {
      console.log("edit corner");
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
  useEffect(() => {
    console.log("currentHotspotId đã cập nhật:", currentHotspotId);
  }, [currentHotspotId]);
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
    console.log("currentHotspotType...", currentHotspotType);
    const limit = (basicProps?.scale || 1) * 5 + 5;

    const minX = point.x - limit;
    const maxX = point.x + limit;
    const minY = point.y - limit;
    const maxY = point.y + limit;
    const minZ = point.z - limit;
    const maxZ = point.z + limit;

    const isNear = hotspotPosition.some((h) => {
      return (
        h[0] > minX &&
        h[0] < maxX &&
        h[1] > minY &&
        h[1] < maxY &&
        h[2] > minZ &&
        h[2] < maxZ
      );
    });
    if (isNear) {
      Swal.fire({
        title: "Cảnh báo",
        text: "Các hotspot không được nằm gần nhau",
        icon: "warning",
        showCancelButton: false,
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }

    const newPoints = [...currentPoints, [point.x, point.y, point.z]] as [
      number,
      number,
      number
    ][];

    // Với hotspot loại 3: thu thập 4 điểm và dispatch khi đủ
    if (currentHotspotType === 3) {
      setCurrentPoints(newPoints);

      if (newPoints.length === 4) {
        const updatedProps: BaseHotspot = {
          ...(basicProps as Required<BaseHotspot>),
          positionX: point.x,
          positionY: point.y,
          positionZ: point.z,
        };

        dispatch(
          addMediaHotspot({
            ...updatedProps,
            type: 3,
            mediaType: "",
            mediaUrl: "",
            caption: "",
            cornerPointList: JSON.stringify(newPoints),
          })
        );

        setAssignable(false);
        setCurrentHotspotType(1);
        setCurrentPoints([]);
      }
      return;
    }

    // Với hotspot loại 1, 2, 4
    const updatedProps: BaseHotspot = {
      ...(basicProps as Required<BaseHotspot>),
      positionX: point.x,
      positionY: point.y,
      positionZ: point.z,
    };

    switch (currentHotspotType) {
      case 1:
        dispatch(
          addNavigationHotspot({
            ...updatedProps,
            type: 1,
            targetNodeId: "",
          })
        );
        break;

      case 2:
        dispatch(
          addInformationHotspot({
            ...updatedProps,
            type: 2,
            title: "",
            content: "",
          })
        );
        break;

      case 4:
        dispatch(
          addModelHotspot({
            ...updatedProps,
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
    dispatch(addHotspotPosition([point.x, point.y, point.z]));

    if ([1, 2, 4].includes(currentHotspotType)) {
      setAssignable(false);
      setCurrentHotspotType(1);
    }
  };
  /**
   *  Xử lý đổi nội dung content cho từng task (1,2,3) áp dụng trên TaskContainerCT từ RightMenuCT.
   */
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
              setCurrentHotspotType={setCurrentHotspotType}
              onPropsChange={handleOnPropsChange}
              currentPanorama={currentPanorama}
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

  const { openTaskIndex, completedTaskIds, unlockedTaskIds, handleOpenTask } =
    useSequentialTasks(tasks.length);

  const [preTaskIndex, setPreTaskIndex] = useState<number | null>(null);

  const currentStep = useSelector((state: RootState) => state.step.currentStep);

  /**
   *
   * @param targetNodeId
   * @param hotspotTargetPosition
   */
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

  const handleBackStep2 = () => {
    Swal.fire({
      icon: "question",
      title: "Bạn có chắc chắn muốn quay lại bước trước?",
      text: "Các thay đổi chưa được lưu lại.",
      showCancelButton: true,
      confirmButtonText: "Quay lại",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearPanorama());
        dispatch(clearHotspot());
        dispatch(prevStep());
      }
    });
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
          onContextMenu={(e) => {
            e.preventDefault();
          }}
        >
          {/* <Axes /> */}
          <axesHelper args={[10]} position={[0, -90, 0]} />
          <UpdateCameraOnResize />
          <TourScene
            nodeId={currentSelectId ?? ""}
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            textureCurrent={currentPanoramaUrl ?? "/khoa.jpg"}
            onPointerDown={handleScenePointerDown}
            lightIntensity={lightIntensity}
          />

          {currentPanorama && (
            <MiniMap
              currentPanorama={currentPanorama}
              angleCurrent={cameraAngle}
            />
          )}

          <CamControls
            targetPosition={targetPosition}
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            autoRotate={autoRotate === 1 ? true : false}
            autoRotateSpeed={speedRotate}
            onAngleChange={setCameraAngle}
          />

          {hotspotNavigations
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
          {hotspotInfos
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <GroundHotspotInfo
                key={hotspot.id}
                setCurrentHotspotId={setCurrentHotspotId}
                hotspotInfo={hotspot}
              />
            ))}
          {hotspotModels
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <GroundHotspotModel
                key={hotspot.id}
                setCurrentHotspotId={setCurrentHotspotId}
                hotspotModel={hotspot}
              />
            ))}

          {hotspotMedias
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => (
              <VideoMeshComponent
                key={hotspot.id}
                hotspotMedia={hotspot}
                setCurrentHotspotId={setCurrentHotspotId}
              />
            ))}
          {/* {hotspotMedias
            .filter((hotspot) => hotspot.nodeId === currentSelectId)
            .map((hotspot) => {
              const cornerPointList = JSON.parse(hotspot.cornerPointList) as [
                number,
                number,
                number
              ][];
              return (
                <>
                  {cornerPointList.map((point, index) => {
                    return (
                    <PointMedia
                      key={`${hotspot.id}-${index}`}
                      hotspotId={hotspot.id}
                      index={index}
                      cornerPointList={cornerPointList}
                      onDragEnd={() => setChangeCornerMedia(false)}
                    />);
                  })}
                </>
              );
            })} */}
          {/* {currentPoints.map((point, index) => (
            <PointMedia key={`p-${index}`} position={point} />
          ))} */}
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
          <div className={styles.header_tour_left}>
            <FaAngleLeft
              className={styles.back_btn}
              onClick={() => {
                handleBackStep2();
              }}
            />
            <span>{CREATE_TOUR_STEPS[currentStep - 1].name}</span>
          </div>
          <span className={styles.number_step}>{currentStep}</span>
          <div className={styles.toggleRightMenu}>
            <IoMdMenu
              className={styles.show_menu}
              onClick={() => handleOpenMenu()}
            />
          </div>
        </div>
        {/* Hiển thị menu bên phải.*/}
        <div
          className={`${styles.rightMenu} ${isMenuVisible ? styles.show : ""}`}
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
            completedTaskIds={completedTaskIds}
            unlockedTaskIds={unlockedTaskIds}
            onTaskClick={handleOpenTask}
            setPreOpenTask={setPreTaskIndex}
          />
        </div>
        {/* tasks */}
        <div
          className={`${styles.task_container} ${
            isMenuVisible && openTaskIndex !== null && currentHotspotId === null
              ? styles.show
              : ""
          }`}
        >
          <TaskContainerCT
            id={preTaskIndex}
            name={tasks.find((t) => t.id === preTaskIndex)?.title || ""}
          >
            {preTaskIndex
              ? getTaskContentById(openTaskIndex ?? preTaskIndex)
              : ""}
          </TaskContainerCT>
        </div>
        {/* Hộp chỉnh sửa hotspot */}
        <div
          className={`${styles.update_hotspot_container} ${
            currentHotspotId != null ? styles.show : ""
          }`}
        >
          <UpdateHotspot
            hotspotId={currentHotspotId}
            setHotspotId={setCurrentHotspotId}
            onPropsChange={handleOnPropsChange}
            setChangeCorner={setChangeCornerMedia}
          />
        </div>
        {/* Hướng dẫn sử dụng */}
        <button className={styles.guide_button} title="Hướng dẫn">
          <FaBook />
        </button>
      </div>
    </>
  );
};

export default CreateTourStep2;
