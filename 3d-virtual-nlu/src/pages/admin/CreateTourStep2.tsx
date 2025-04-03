import * as THREE from "three";
import { useState, useEffect, useMemo } from "react";
import styles from "../../styles/createTourStep2.module.css";
import { FaAngleLeft, FaAngleRight, FaClock } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import axios from "axios";
import Swal from "sweetalert2";
import { FaHome } from "react-icons/fa";
import { validateAndNavigate } from "../../features/PreValidate";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";

interface Task1Props{
  isOpen1: boolean;
  nameNode: string;
  setNameNode: (nameNode: string) => void;
  desNode: string;
  setDesNode: (desNode: string) => void;
}

// Component cho Task1
const Task1 = ({ isOpen1, nameNode, setNameNode, desNode, setDesNode }: Task1Props) => (
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

// Component cho Task2
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
          min="0.5"
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

// Component cho Task3
const Task3 = ({ isOpen3 }) => (
  <div className={`${styles.task3} ${isOpen3 ? styles.open_task3 : ""}`}>
    <h3>3. Tạo điểm di chuyển</h3>
    <div className={styles.contain_input}>
      <label className={styles.label}>Biểu tượng:</label>
      <FaHome />
      <input type="checkbox" />
      <FaClock />
      <input type="checkbox" />
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

// Component cho Task4
const Task4 = ({ isOpen4 }) => (
  <div className={`${styles.task4} ${isOpen4 ? styles.open_task4 : ""}`}>
    <h3>4. Tạo chú thích</h3>
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

// Component cho Task5
const Task5 = ({ isOpen5 }) => (
  <div className={`${styles.task5} ${isOpen5 ? styles.open_task5 : ""}`}>
    <h3>5. Chèn mô hình 3D</h3>
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

interface NodeProps {
  url: string;
}

const Node: React.FC<NodeProps> = ({ url }) => {
  const texture = useTexture(url);
  // const texture = new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh>
      <sphereGeometry args={[500, 128, 128]} />
      <meshStandardMaterial map={texture} side={THREE.BackSide} /> // sử dụng
      standard để phản chiếu ánh sáng, basic thì không
    </mesh>
  );
};

interface SceneProps {
  cameraPosition: [number, number, number];
  lightIntensity: number;
}

const Scene = ({ cameraPosition, lightIntensity }: SceneProps) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.updateProjectionMatrix(); // Cập nhật lại camera
  }, [cameraPosition]); // Chạy mỗi khi cameraPosition thay đổi

  return (
    <>
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
    </>
  );
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
  const panoramaURL = useSelector(
    (state: RootState) => state.panorama.panoramaUrl
  );
  const spaceId = useSelector((state: RootState) => state.panorama.spaceId);
  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [lightIntensity, setLightIntensity] = useState(2);
  const [autoRotate, setAutoRotate] = useState(false);
  const [speedRotate, setSpeedRotate] = useState(1);
  const [angle, setAngle] = useState(0); // Góc quay quanh trục Y
  const radius = 100; // Bán kính quay

  // Tính toán vị trí camera từ góc quay quanh trục Y
  const cameraPosition = useMemo(() => {
    const radians = (angle * Math.PI) / 180; // Chuyển độ sang radian
    return [radius * Math.cos(radians), 0, radius * Math.sin(radians) + 0.1]; // Camera quay quanh trục Y
  }, [angle]);

  // const isValid = validateAndNavigate(
  //   [
  //     { value: user, name: user },
  //     { value: panoramaURL, name: panoramaURL },
  //     { value: spaceId, name: spaceId },
  //   ],
  //   "/admin/createTour",
  //   "Vui lòng hoàn tất bước trước đó để tiếp tục!"
  // );

  // if (!isValid) {
  //   return;
  // }

  const handleOpenMenu = () => {
    setIsMenuVisible((preState) => !preState);
  };

  const handleClose = () => {
    navigate("/admin/createTour");
  };

  const handleMouseDown = (event: any) => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = (event: any) => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  // thiết lập hoàn tất bước 2
  const handleDoneStep2 = async () => {
    console.log("spaceId: ", spaceId);
    console.log("userId: ", user.id);
    console.log("panoramaURL: ", panoramaURL);
    const response = await axios.post("http://localhost:8080/api/admin/node", {
      spaceId: spaceId,
      userId: user.id,
      url: panoramaURL,
      name: nameNode,
      description: desNode,
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
      <div className={styles.preview_tour}>
        {/* main - canvas */}
        <Canvas
          camera={{ fov: 75, position: cameraPosition }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ cursor: cursor }}
        >
          <Scene
            cameraPosition={cameraPosition}
            lightIntensity={lightIntensity}
          />
          <OrbitControls
            enableZoom={true}
            rotateSpeed={1.5}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={speedRotate}
          />
          <Node url={panoramaURL ?? "/khoa.jpg"} />
        </Canvas>

        {/* Header chứa logo + close */}
        <div className={styles.header_tour}>
          <div className={styles.step_title}>
            <FaAngleLeft className={styles.back_btn} onClick={handleClose} />
            <h2>2) Thiết lập thông số</h2>
          </div>
          <IoMdMenu className={styles.show_menu} onClick={handleOpenMenu} />
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
              <span className={styles.task_name}>Tạo điểm di chuyển</span>
            </li>
            <li className={styles.task} onClick={() => handleOpenTask(4)}>
              <span className={styles.task_name}>Tạo chú thích</span>
            </li>
            <li className={styles.task} onClick={() => handleOpenTask(5)}>
              <span className={styles.task_name}>Chèn mô hình 3D</span>
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
        <Task3 isOpen3={openTaskIndex === 3} />
        <Task4 isOpen4={openTaskIndex === 4} />
        <Task5 isOpen5={openTaskIndex === 5} />
      </div>
    </>
  );
};

export default CreateTourStep2;
