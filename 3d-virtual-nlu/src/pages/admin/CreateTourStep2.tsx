import * as THREE from "three";
import { useState, useEffect, useMemo, useRef } from "react";
import styles from "../../styles/createTourStep2.module.css";
import { FaAngleLeft, FaAngleRight, FaClock, FaPlus } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import axios from "axios";
import Swal from "sweetalert2";
import { FaHome } from "react-icons/fa";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { useRaycaster } from "../../hooks/useRaycaster";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";

//Tuỳ chỉnh thông tin không gian.
interface Task1Props {
  isOpen1: boolean;
  nameNode: string;
  setNameNode: (nameNode: string) => void;
  desNode: string;
  setDesNode: (desNode: string) => void;
}

const Task1 = ({
  isOpen1,
  nameNode,
  setNameNode,
  desNode,
  setDesNode,
}: Task1Props) => (
  <div className={`${styles.task1} ${isOpen1 ? styles.open_task1 : ""}`}>
    <h3>1. Thông tin không gian</h3>
    <div className={styles.contain_input}>
      <label className={styles.label}>Tên:</label>
      <input
        type="text"
        className={styles.name_input}
        placeholder="Tên không gian"
        value={nameNode}
        onChange={(e) => setNameNode(e.target.value)}
      />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Giới thiệu:</label>
      <textarea
        className={styles.descript_input}
        placeholder="Mô tả không gian.."
        value={desNode}
        onChange={(e) => setDesNode(e.target.value)}
      />
    </div>
  </div>
);

// Tuỳ chỉnh thông số kỹ thuật.
interface Task2Props {
  isOpen2: boolean;
  angle: number;
  setAngle: (angle: number) => void;
  lightIntensity: number;
  setLightIntensity: (lightIntensity: number) => void;
  autoRotate: boolean;
  setAutoRotate: (autoRotate: boolean) => void;
  speedRotate: number;
  setSpeedRotate: (speedRotate: number) => void;
}
const Task2 = ({
  isOpen2,
  angle,
  setAngle,
  lightIntensity,
  setLightIntensity,
  autoRotate,
  setAutoRotate,
  speedRotate,
  setSpeedRotate,
}: Task2Props) => (
  <div className={`${styles.task2} ${isOpen2 ? styles.open_task2 : ""}`}>
    <h3>2. Thông số không gian</h3>
    <div className={styles.contain_input}>
      <label className={styles.label}>Hướng nhìn mặc định:</label>
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={angle}
        className={styles.name_input}
        placeholder="Hướng nhìn"
        onChange={(e) => setAngle(Number(e.target.value))}
      />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Độ dịch chuyển:</label>
      <input type="range" className={styles.name_input} />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Ánh sáng:</label>
      <input
        type="range"
        min="1"
        max="8"
        step="0.1"
        value={lightIntensity}
        onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
      />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Tự động xoay:</label>
      <input
        type="checkbox"
        checked={autoRotate} // Thiết lập giá trị checked cho checkbox
        onChange={(e) => setAutoRotate(e.target.checked)} // Cập nhật autoRotate
      />
    </div>
    {autoRotate ? (
      <div className={styles.contain_input}>
        <label className={styles.label}>Tốc độ xoay:</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={speedRotate}
          onChange={(e) => setSpeedRotate(parseFloat(e.target.value))}
        />
      </div>
    ) : (
      ""
    )}
    <div className={styles.contain_input}>
      <label className={styles.label}>Độ phóng to:</label>
      <input type="range" />
    </div>
  </div>
);

// //Tuỳ chỉnh thêm các điểm nóng.
// interface Task3Props {
//   isOpen3: boolean;
//   assignable: boolean;
//   setAssignable: (value: boolean) => void;
//   hotspotModels: HotspotModel[];
//   setHotspotModels: (value: HotspotModel[]) => void;
// }

// Component cho Task3
// const Task3 = ({
//   isOpen3,
//   assignable,
//   setAssignable,
//   hotspotModels,
// }: Task3Props) => {
//   const [openTypeIndex, setOpenTypeIndex] = useState<number | null>(1); // State để lưu index của type đang mở
//   const hotspotType = useSelector(
//     (state: RootState) => state.data.hotspotTypes
//   );

//   const handleChooseType = (typeIndex: number) => {
//     setOpenTypeIndex((prevIndex) =>
//       prevIndex === typeIndex ? null : typeIndex
//     );
//   };

//   return (
//     <div className={`${styles.task3} ${isOpen3 ? styles.open_task3 : ""}`}>
//       <div className="header" style={{ display: "flex", position: "relative" }}>
//         <h3>3. Tạo điểm nhấn</h3>
//         <select
//           name=""
//           id=""
//           style={{
//             position: "absolute",
//             right: "10px",
//             top: "50%",
//             transform: "translateY(-50%)",
//           }}
//           onChange={(e) => handleChooseType(Number(e.target.value))}
//         >
//           {hotspotType.map((type) => (
//             <option value={type.id}>{type.name}</option>
//           ))}
//         </select>
//       </div>
//       <TypeNavigation isOpenTypeNavigation={openTypeIndex == 1} />
//       <TypeInfomation isOpenTypeInfomation={openTypeIndex == 2} />
//       <TypeModel
//         isOpenTypeModel={openTypeIndex == 4}
//         hotspotModels={hotspotModels}
//         assignable={assignable}
//         setAssignable={setAssignable}
//       />
//     </div>
//   );
// };

// Điểm nóng task3 - Điểm di chuyển.
interface TypeNavigationProps {
  isOpenTypeNavigation: boolean;
}

// Component cho Task3
const TypeNavigation = ({ isOpenTypeNavigation }: TypeNavigationProps) => (
  <div
    className={`${styles.type_navigation} ${
      isOpenTypeNavigation ? styles.open_type_navigation : ""
    }`}
  >
    <div className={styles.contain_input}>
      <label className={styles.label}>Biểu tượng:</label>
      <input type="checkbox" />
      <FaHome />
      <input type="checkbox" />
      <FaClock />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Điểm di chuyển:</label>
      <button>Chọn điểm di chuyển</button>
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Âm thanh di chuyển:</label>
      <FaHome />
      <input type="checkbox" />
      <FaClock />
      <input type="checkbox" />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Hiệu ứng di chuyển:</label>
      <FaHome />
      <input type="checkbox" />
      <FaClock />
      <input type="checkbox" />
    </div>
  </div>
);

interface TypeInfomationProps {
  isOpenTypeInfomation: boolean;
}

// Component cho Task4
const TypeInfomation = ({ isOpenTypeInfomation }: TypeInfomationProps) => (
  <div
    className={`${styles.type_infomation} ${
      isOpenTypeInfomation ? styles.open_type_infomation : ""
    }`}
  >
    <div>
      <label className={styles.label}>Biểu tượng:</label>
      <FaHome />
      <input type="checkbox" />
      <FaClock />
      <input type="checkbox" />
    </div>
    <div>
      <label className={styles.label}>Vị trí chú thích:</label>
      <button>Chọn vị trí</button>
    </div>
  </div>
);

interface ModelProps {
  modelURL: string;
}
const Model: React.FC<ModelProps> = ({ modelURL }) => {
  const { scene } = useGLTF(modelURL);
  const modelRef = useRef<THREE.Group>(null);

  // Xoay model liên tục mỗi frame
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01; // Tốc độ xoay
    }
  });

  return (
    <group ref={modelRef} position={[30, -10, -10]} scale={3}>
      <primitive object={scene}>
        <ambientLight color={"#fff"} intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
      </primitive>
    </group>
  );
};

interface HotspotModel {
  id: number;
  position: [number, number, number];
  modelURL?: string;
  assigned?: boolean;
}

interface TypeModelProps {
  isOpenTypeModel: boolean;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModel[];
  // setHotspotModels: (value: HotspotModel[]) => void;
}
// Component cho Task5
const TypeModel = ({
  isOpenTypeModel,
  assignable,
  setAssignable,
  hotspotModels,
}: // setHotspotModels,
TypeModelProps) => {
  const [panoramaURL, setPanoramaURL] = useState<string | null>(null);
  const handleAssign = () => {
    setAssignable(true);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPanoramaURL(URL.createObjectURL(file));
    }
  };

  return (
    <div
      className={`${styles.type_model} ${
        isOpenTypeModel ? styles.open_type_model : ""
      }`}
    >
      <div>
        <label className={styles.label}>Biểu tượng:</label>
        <FaHome />
        <input type="checkbox" />
        <FaClock />
        <input type="checkbox" />
      </div>
      <div>
        <label className={styles.label}>Vị trí mô hình:</label>
        <button onClick={handleAssign}>Chọn vị trí</button>
      </div>
      {hotspotModels.map((hpm) => (
        <div key={hpm.id}>
          <div
            style={{
              backgroundColor: "white",
              color: "black",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              textAlign: "center",
            }}
          >
            {hpm.id}
          </div>
          <p>
            <span style={{ color: "pink" }}> {hpm.position[0]} </span>
            <span style={{ color: "yellow" }}> {hpm.position[1]} </span>
            <span style={{ color: "lightblue" }}> {hpm.position[2]} </span>
          </p>
          <p> {hpm.modelURL}</p>
          <div>
            <label className={styles.label}>Tệp mô hình:</label>
            <input
              type="file"
              accept=".glb, .gltf"
              // accept="*/*"
              onChange={handleFileChange}
            />
          </div>
          <button>Thiết lập</button>
        </div>
      ))}
    </div>
  );
};

const RaycastOnTask5 = ({
  isActive,
  onAddHotspot,
  sphereRef,
  assignable,
  setAssignable,
}: {
  isActive: boolean;
  onAddHotspot: (position: [number, number, number]) => void;
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
        onAddHotspot([point.x, point.y, point.z]);
        setAssignable(false);
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
  // const texture = new THREE.TextureLoader().load(url);
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
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [openTaskIndex, setOpenTaskIndex] = useState<number | null>(null); // State để lưu index của task đang mở

  // check done task
  const [isDone1, setIsDone1] = useState(false);
  // item task 1
  const [nameNode, setNameNode] = useState("");
  const [desNode, setDesNode] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);
  // const panoramaURL = useSelector(
  //   (state: RootState) => state.panorama.panoramaUrls
  // );

  const { panoramaList, currentSelectPosition } = useSelector(
    (state: RootState) => ({
      panoramaList: state.panoramas.panoramaList,
      currentSelectPosition: state.panoramas.currentSelectedPosition,
    })
  );

  const currentPanoramaUrl = panoramaList[currentSelectPosition]?.url;
  console.log("Ảnh hiện tại", currentPanoramaUrl);

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

  const handleOpenMenu = () => {
    if (isMenuVisible) {
      setOpenTaskIndex(null);
    }
    setIsMenuVisible((preState) => !preState);
  };

  const handleClose = () => {
    navigate("/admin/createTour");
  };

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  // thiết lập hoàn tất bước 2
  const handleDoneStep2 = async () => {
    console.log("spaceId: ", spaceId);
    console.log("userId: ", user.id);
    const response = await axios.post("http://localhost:8080/api/admin/node", {
      spaceId: spaceId,
      userId: user.id,
      url: currentPanoramaUrl,
      name: nameNode,
      description: desNode,
      positionX: cameraPosition[0],
      positionY: cameraPosition[1],
      positionZ: cameraPosition[2],
      lightIntensity: lightIntensity,
      autoRotate: autoRotate ? 1 : 0,
      speedRotate: speedRotate,
    });
    if (response.data.statusCode == 1000) {
      Swal.fire("Thành công", "Tạo tour thành công", "success");
      navigate(`${location.pathname.replace("/2", "")}/3`);
    } else {
      Swal.fire("Loi", "Tạo tour that bai", "error");
    }
  };

  useEffect(() => {
    const handleCheckTask1 = () => {
      if (nameNode.trim() != "" && desNode.trim() != "") {
        setIsDone1(true);
      } else {
        setIsDone1(false);
      }
    };
    handleCheckTask1();
  }, [nameNode, desNode]);

  const handleOpenTask = (taskIndex: number) => {
    // Nếu taskIndex đã được mở, thì đóng nó, ngược lại mở task mới
    setOpenTaskIndex((prevIndex) =>
      prevIndex === taskIndex ? null : taskIndex
    );
  };

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

          <RaycastOnTask5
            isActive={openTaskIndex === 5}
            onAddHotspot={handleAddHotspot}
            sphereRef={sphereRef}
            assignable={assignable}
            setAssignable={setAssignable}
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
            {/* list node */}
            <div className={styles.node}>
              <div className={styles.nodeView}></div>
              <span>Name</span>
            </div>
            <div className={styles.node}>
              <div className={styles.nodeView}></div>
              <span>Name</span>
            </div>
            <div className={styles.add_node_button}>
              <FaPlus />
            </div>
          </div>
          <div className={styles.toggleRightMenu}>
            <IoMdMenu className={styles.show_menu} onClick={handleOpenMenu} />
          </div>
        </div>

        {/* Menu bên phải */}
        <div
          className={`${styles.right_menu} ${isMenuVisible ? styles.show : ""}`}
        >
          <div style={{ display: "flex" }}>
            <FaAngleRight
              className={styles.show_menu}
              onClick={handleOpenMenu}
            />
            <h2>Task</h2>
          </div>
          <ul>
            <li
              className={`${isDone1 ? styles.done_task : styles.task}`}
              onClick={() => handleOpenTask(1)}
            >
              <div className="check_done"></div>
              <span className={styles.task_name}>Thông tin không gian</span>
            </li>
            <li className={styles.task} onClick={() => handleOpenTask(2)}>
              <span className={styles.task_name}>Thông số không gian</span>
            </li>
            <li className={styles.task} onClick={() => handleOpenTask(3)}>
              <span className={styles.task_name}>Tạo điểm nhấn</span>
            </li>
          </ul>
          <button className={styles.done_button} onClick={handleDoneStep2}>
            Tiếp tục
          </button>
        </div>

        {/* Render các component task */}
        <Task1
          nameNode={nameNode}
          setNameNode={setNameNode}
          desNode={desNode}
          setDesNode={setDesNode}
          isOpen1={openTaskIndex === 1}
        />
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
