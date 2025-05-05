import * as THREE from "three";
import { useState, useEffect, useMemo, useRef, Component } from "react";
import styles from "../../styles/createTourStep2.module.css";
import { FaAngleLeft, FaAngleRight, FaClock, FaPlus } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { useRaycaster } from "../../hooks/useRaycaster";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import { selectPanorama } from "../../redux/slices/PanoramaSlice";
import RightMenuCreateTour from "../../components/admin/RightMenuCT";
import TaskContainerCT from "../../components/admin/TaskContainerCT";
import { useSequentialTasks } from "../../hooks/useSequentialTasks";
import Task1DisplayInfo from "../../components/admin/taskCreateTourList/Task1DisplayInfo";
import Task2 from "../../components/admin/taskCreateTourList/Task2BasicConfig";
import { title } from "framer-motion/client";

// //Tuỳ chỉnh thêm các điểm nóng.

const RaycastOnTask5 = ({
  onAddHotspot,
  sphereRef,
  assignable,
  setAssignable,
}: {
  // isActive: boolean;
  onAddHotspot: (position: [number, number, number]) => void;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
}) => {
  const { getIntersectionPoint } = useRaycaster();

  useEffect(() => {
    // if (!isActive || !assignable) return;

    const handleClick = (event: MouseEvent) => {
      const point = getIntersectionPoint(event, sphereRef.current);
      if (point) {
        onAddHotspot([point.x, point.y, point.z]);
        setAssignable(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => {
      setAssignable(false);
      window.removeEventListener("click", handleClick);
    };
  }, [assignable]);

  return null; // không render gì cả, chỉ xử lý raycast khi Task5 mở
};

interface NodeProps {
  url: string;
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  lightIntensity: number;
}

const Node: React.FC<NodeProps> = ({
  url,
  radius,
  sphereRef,
  lightIntensity,
}) => {
  const texture = useTexture(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh
      ref={(el) => {
        if (el && sphereRef) {
          sphereRef.current = el;
          console.log("sphereRef được gán trong Node:", sphereRef.current);
        }
      }}
    >
      <ambientLight intensity={lightIntensity} color="#ffffff" />
      <pointLight
        position={[100, 100, 100]}
        color="#ffcc00"
        castShadow
        intensity={lightIntensity}
      />
      <directionalLight
        position={[5, 5, 5]}
        intensity={lightIntensity}
        color="#ffffff"
        castShadow
      />
      <sphereGeometry args={[radius, 128, 128]} />
      <meshStandardMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

interface SceneProps {
  cameraPosition: [number, number, number];
}

const Scene = ({ cameraPosition }: SceneProps) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.updateProjectionMatrix(); // Cập nhật lại camera
  }, [cameraPosition]); // Chạy mỗi khi cameraPosition thay đổi

  return null;
};

const CreateTourStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Xử lý toggle hiển thị menu - start
   */

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleOpenMenu = () => {
    if (isMenuVisible) {
      // setOpenTaskIndex(null);
    }
    setIsMenuVisible((preState) => !preState);
  };

  /**
   * Xử lý toggle hiển thị menu - end
   */

  // check done task
  // item task 1
  const [nameNode, setNameNode] = useState("");
  const [desNode, setDesNode] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);

  const spaceId = useSelector((state: RootState) => state.panoramas.spaceId);
  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  // hotspot
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [hotspots, setHotspots] = useState<
    { id: number; position: [number, number, number] }[]
  >([]);

  // hostpost model
  type HotspotModel = {
    id: number;
    position: [number, number, number];
    modelURL?: string; // model gán vào hotspot
    assigned?: boolean;
  };

  const [hotspotModels, setHotspotModels] = useState<HotspotModel[]>([]);

  const handleAddHotspot = (position: [number, number, number]) => {
    setHotspots((prev) => [...prev, { id: prev.length + 1, position }]);
    setHotspotModels((prev) => [...prev, { id: prev.length + 1, position }]);
  };
  const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null); //test

  const [lightIntensity, setLightIntensity] = useState(2);
  const [autoRotate, setAutoRotate] = useState(false);
  const [speedRotate, setSpeedRotate] = useState(1);
  const [angle, setAngle] = useState(90); // Góc quay quanh trục Y
  const radius = 100; // Bán kính quay
  const originalZ = 0.0000001; // Bán kính quay

  // Tính toán vị trí camera từ góc quay quanh trục Y
  const cameraPosition = useMemo((): [number, number, number] => {
    const radians = (angle * Math.PI) / 180; // Chuyển độ sang radian
    // return [radius * Math.cos(radians), 0, radius * Math.sin(radians) + 0.1]; // Camera quay quanh trục Y
    return [originalZ * Math.cos(radians), 0, originalZ * Math.sin(radians)]; // Camera quay quanh trục Y
  }, [angle]);

  const [assignable, setAssignable] = useState(false);

  const handledSwitchTexture = () => {};

  const handleClose = () => {
    navigate("/admin/createTour");
  };

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  // useEffect(() => {
  //   const handleCheckTask1 = () => {
  //     if (nameNode.trim() != "" && desNode.trim() != "") {
  //       setIsDone1(true);
  //     } else {
  //       setIsDone1(false);
  //     }
  //   };
  //   handleCheckTask1();
  // }, [nameNode, desNode]);

  // Lấy dữ liệu được thiết lập sẵn dưới Redux lên.
  const dispatch = useDispatch();
  const { panoramaList, currentSelectedPosition } = useSelector(
    (state: RootState) => state.panoramas
  );

  const handleSelectNode = (index: number) => {
    dispatch(selectPanorama(index));
  };

  const getTaskContentById = (id: number): React.ReactNode => {
    switch (id) {
      case 1:
        return (
          <>
            <Task1DisplayInfo
              nameNode={nameNode}
              setNameNode={setNameNode}
              desNode={desNode}
              setDesNode={setDesNode}
            />
          </>
        );
      case 2:
        return (
          <>
            <Task2
              isOpen2={openTaskIndex === 2}
              angle={angle}
              setAngle={setAngle}
              lightIntensity={lightIntensity}
              setLightIntensity={setLightIntensity}
              autoRotate={autoRotate}
              setAutoRotate={setAutoRotate}
              speedRotate={speedRotate}
              setSpeedRotate={setSpeedRotate}
            />
          </>
        );
      case 3:
        return (
          <>
            <RaycastOnTask5
              onAddHotspot={handleAddHotspot}
              sphereRef={sphereRef}
              assignable={assignable}
              setAssignable={setAssignable}
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
      title: "Chèn mô hình",
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

  const currentPanoramaUrl = panoramaList[currentSelectedPosition]?.url;

  return (
    <>
      <div className={styles.previewTour}>
        <Canvas
          camera={{
            fov: 75,
            position: cameraPosition,
            aspect: window.innerWidth / window.innerHeight,
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <Node
            url={currentPanoramaUrl ?? "/khoa.jpg"}
            radius={radius}
            sphereRef={sphereRef}
            lightIntensity={lightIntensity}
          />
          <Scene cameraPosition={cameraPosition} />
          <OrbitControls
            rotateSpeed={0.5}
            autoRotate={autoRotate}
            autoRotateSpeed={speedRotate}
          />

          {hotspotModels.map((hotspot) => (
            <GroundHotspotModel
              key={hotspot.id}
              position={hotspot.position}
              setHoveredHotspot={setHoveredHotspot}
            />
          ))}
        </Canvas>

        <div className={styles.header_tour}>
          <div className={styles.thumbnailsBox}>
            {panoramaList.map((item, index) => (
              <div key={index} className={styles.node}>
                <div
                  className={` ${styles.nodeView}  ${
                    index === currentSelectedPosition ? styles.nodeSelected : ""
                  }`}
                  onClick={() => handleSelectNode(index)}
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

        {/* <Task3
          isOpen3={openTaskIndex === 3}
          hotspotModels={hotspotModels}
          assignable={assignable}
          setAssignable={setAssignable}
        /> */}
      </div>
    </>
  );
};

export default CreateTourStep2;
