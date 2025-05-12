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
  HotspotModel,
  HotspotNavigation,
  HotspotType,
} from "../../redux/slices/HotspotSlice";
import GroundHotspot from "../../components/visitor/GroundHotspot";

// //Tuỳ chỉnh thêm các điểm nóng.

export interface VideoMeshProps {
  cornerPoints: any[];
  currentVideoUrl: string;
  // videoMeshes: HotspotMediaCreateRequest[];
  // setVideoMeshes: React.Dispatch<
  //   React.SetStateAction<HotspotMediaCreateRequest[]>
  // >;
  setCornerPoints: React.Dispatch<
    React.SetStateAction<[number, number, number][]>
  >;
  setChooseCornerMediaPoint: (value: boolean) => void;
}

const VideoMeshComponent = ({
  cornerPoints,
  currentVideoUrl,
  // videoMeshes,
  // setVideoMeshes,
  setCornerPoints,
  setChooseCornerMediaPoint,
}: VideoMeshProps) => {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  //tính trung điểm của 4 góc
  const getCenterOfPoints = (points: [number, number, number][]) => {
    const center = [0, 0, 0];
    for (let i = 0; i < 4; i++) {
      center[0] += points[i][0];
      center[1] += points[i][1];
      center[2] += points[i][2];
    }
    return center.map((v) => v / 4) as [number, number, number];
  };

  const createCustomGeometry = (points: [number, number, number][]) => {
    const geometry = new THREE.BufferGeometry();
    const center = getCenterOfPoints(points);

    const vertices = new Float32Array([
      points[0][0] - center[0],
      points[0][1] - center[1],
      points[0][2] - center[2],
      points[1][0] - center[0],
      points[1][1] - center[1],
      points[1][2] - center[2],
      points[2][0] - center[0],
      points[2][1] - center[1],
      points[2][2] - center[2],
      points[3][0] - center[0],
      points[3][1] - center[1],
      points[3][2] - center[2],
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    // gắn center lại để dùng bên ngoài nếu cần
    geometry.userData.center = center;

    return geometry;
  };
  const textureCreatedRef = useRef(false);

  useEffect(() => {
    if (cornerPoints.length === 4 && currentVideoUrl) {
      const video = document.createElement("video");
      video.src = currentVideoUrl;
      video.crossOrigin = "anonymous";
      video.muted = false;
      video.playsInline = true;
      video.loop = true;
      video.autoplay = true;
      video.style.display = "none";
      document.body.appendChild(video);

      const handleCanPlay = () => {
        if (textureCreatedRef.current) return;

        const tex = new THREE.VideoTexture(video);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.format = THREE.RGBFormat;
        tex.image.width = video.videoWidth;
        tex.image.height = video.videoHeight;
        tex.needsUpdate = true;

        setTexture(tex);
        textureCreatedRef.current = true;

        video.play().catch((err) => console.warn("Video play error:", err));
        setChooseCornerMediaPoint(false);
      };

      video.addEventListener("canplaythrough", handleCanPlay);
      video.load();

      // const newMedia: HotspotMediaCreateRequest = {
      //   type: 1,
      //   iconId: 1,
      //   positionX: center[0],
      //   positionY: center[1],
      //   positionZ: center[2],
      //   pitchX: 10,
      //   yawY: 15,
      //   rollZ: 5,
      //   scale: 1,
      //   mediaType: "VIDEO",
      //   mediaUrl: "",
      //   caption: "Another test",
      //   cornerPointList: JSON.stringify(cornerPoints),
      // };
      // // setVideoMeshes([...videoMeshes, newMedia]);
      // setVideoMeshes((prev) => [...prev, newMedia]);
      // console.log(videoMeshes);

      return () => {
        video.removeEventListener("canplaythrough", handleCanPlay);
        video.pause();
        video.src = "";
        video.remove();
        texture?.dispose();
        setTexture(null);
        textureCreatedRef.current = false; // reset lại cho lần sau
      };
    }
  }, [currentVideoUrl, cornerPoints]);

  if (cornerPoints.length > 4) return null;

  const geometry = createCustomGeometry(cornerPoints);
  const center = geometry.userData.center;

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })
  );

  return <primitive object={mesh} position={center} />;
};

const RaycastOnMedia = ({
  isActive,
  onAddPoint,
  sphereRef,
  cornerPoints,
}: {
  isActive: boolean;
  onAddPoint: (position: [number, number, number]) => void;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  cornerPoints: [number, number, number][];
}) => {
  const { getIntersectionPoint } = useRaycaster();

  useEffect(() => {
    if (!isActive) return;

    const handleClick = (event: MouseEvent) => {
      if (cornerPoints.length >= 4) return; // ✅ Chặn thêm nếu đủ 4
      const point = getIntersectionPoint(event, sphereRef.current);
      if (point) {
        onAddPoint([point.x, point.y, point.z]);
      }
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isActive, cornerPoints]);

  return null;
};

const RaycastOnModel = ({
  isActive,
  addHotspotModel,
  sphereRef,
  assignable,
  setAssignable,
}: {
  isActive: boolean;
  addHotspotModel: (model: HotspotModelCreateRequest) => void;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
}) => {
  const { getIntersectionPoint } = useRaycaster();

  useEffect(() => {
    if (!isActive || !assignable) return;

    const handleClick = (event: MouseEvent) => {
      const point = getIntersectionPoint(event, sphereRef.current);
      if (point) {
        setAssignable(false);
        addHotspotModel({
          type: 1,
          iconId: 1,
          positionX: point.x,
          positionY: point.y,
          positionZ: point.z,
          pitchX: 10,
          yawY: 15,
          rollZ: 5,
          scale: 1,
          modelUrl: "",
          name: "Second model",
          description: "Another test",
        });
      }
    };

    window.addEventListener("click", handleClick);
    return () => {
      setAssignable(false);
      window.removeEventListener("click", handleClick);
    };
  }, [isActive, assignable]);

  return null; // không render gì cả, chỉ xử lý raycast khi Task5 mở
};

interface HotspotModelCreateRequest {
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  modelUrl: string;
  name: string;
  description: string;
}

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

  // hotspot
  const sphereRef = useRef<THREE.Mesh | null>(null);
  // const [hotspots, setHotspots] = useState<
  //   { id: number; position: [number, number, number] }[]
  // >([]);

  // const [cornerPointes, setCornerPointes] = useState<CornerPoint[]>([]);
  // const [videoMeshes, setVideoMeshes] = useState<HotspotMediaCreateRequest[]>(
  //   []
  // );
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");

  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");

  const handleAddPoint = (point: [number, number, number]) => {
    const newPoints = [...currentPoints, point];
    setCurrentPoints(newPoints);

    if (newPoints.length === 4) {
      // const newPoint: CornerPoint = {
      //   id: Date.now().toString(), // Hoặc dùng uuid nếu muốn đẹp hơn
      //   points: newPoints,
      //   mediaUrl: selectedVideoUrl,
      // };

      // setCornerPointes((prev) => [...prev, newPoint]);
      setCurrentPoints([]); // reset để bắt đầu chọn 4 điểm mới
      setChooseCornerMediaPoint(false); // tắt chế độ chọn
    }
  };

  // hostpost model
  // const [hotspotModels, setHotspotModels] = useState<
  //   HotspotModelCreateRequest[]
  // >([]);

  // const addHotspotModel = (newModel: HotspotModelCreateRequest) => {
  //   setHotspotModels((prev) => [...prev, newModel]);
  // };

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
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

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
    if (!currentHotspotType || !assignable) return;

    // const basicProps = {
    //   nodeId: currentPanorama?.id ?? "",
    //   iconId: defaultIconIds[currentHotspotType],
    //   positionX: point.x,
    //   positionY: point.y,
    //   positionZ: point.z,
    //   scale: 1,
    //   pitchX: 0,
    //   yawY: 0,
    //   rollZ: 0,
    // };

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
    console.log('currentPoints::' , currentPoints)
    console.log('currentHotspotType::' , currentHotspotType)
    console.log('---------------------------')

    if ([1, 2, 4].includes(currentHotspotType) || (currentHotspotType == 3 && currentPoints.length == 4)) {
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

    switch (currentHotspotType) {
      case 1:
        if (!basicProps) return;

        dispatch(
          addNavigationHotspot({
            ...basicProps,
            type: 1,
            targetNodeId: "", //set lại sau
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

      case 3:
        if (!basicProps) return;

        dispatch(
          addMediaHotspot({
            ...basicProps,
            type: 3,
            mediaType: "", //image or video
            mediaUrl: "",
            caption: "",
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
            autoRotate: 0, //0 = false, 1= true.
            colorCode: "",
          })
        );
        break;
    }

    setAssignable(false);
    setCurrentHotspotType(null);
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
              // setHotspotModels={setHotspotModels}
              // videoMeshes={videoMeshes} // danh sách các mesh đã hoàn tất gồm các thông số gửi về Server
              // setVideoMeshes={setVideoMeshes} // cập nhật danh sách mesh
              currentPoints={currentPoints} // mesh đang chọn
              setCurrentPoints={setCurrentPoints} // thêm điểm
              assignable={assignable}
              setAssignable={setAssignable}
              chooseCornerMediaPoint={chooseCornerMediaPoint}
              setChooseCornerMediaPoint={setChooseCornerMediaPoint}
              // cornerPointes={cornerPointes} // danh sách các điểm góc của mesh phương tiện
              // setCornerPointes={setCornerPointes}
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
            assignable={assignable}
            setAssignable={setAssignable}
          />
          {/* {hotspotModels.map((hotspot, index) => (
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
          ))} */}
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
          {/* <RaycastOnModel
            isActive={openTaskIndex === 3}
            addHotspotModel={addHotspotModel}
            sphereRef={sphereRef}
            assignable={assignable}
            setAssignable={setAssignable}
          /> */}
          {/* <RaycastOnMedia
            isActive={chooseCornerMediaPoint}
            // onAddPoint={handleAddPoint}
            sphereRef={sphereRef}
            cornerPoints={currentPoints}
          /> */}
          {/* 
          {cornerPointes.map((point, index) => (
            <VideoMeshComponent
              key={point.id}
              cornerPoints={point.points}
              currentVideoUrl={point.mediaUrl}
              setCornerPoints={() => {}} // không cần nếu mesh đã xong
              setChooseCornerMediaPoint={() => {}} // không cần nếu mesh đã xong
              videoMeshes={videoMeshes}
              setVideoMeshes={setVideoMeshes}
            />
          ))} */}

          {currentPoints.map((point, index) => (
            <PointMedia key={`p-${index}`} position={point} />
          ))}
          {currentPoints.length > 1 &&
            currentPoints.map((point, i) => {
              console.log("KẺ NÈ NÍ ƠI", i);

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

          {currentPoints.length === 4 && (
            <Line
              key="closing"
              points={[currentPoints[3], currentPoints[0]]}
              color="cyan"
            />
          )}
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
