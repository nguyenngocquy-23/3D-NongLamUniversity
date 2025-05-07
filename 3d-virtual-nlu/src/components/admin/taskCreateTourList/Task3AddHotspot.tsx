import { useRef, useState } from "react";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import { FaHome } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

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

interface Task3Props {
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModel[];
  setHotspotModels: (value: HotspotModel[]) => void;
}

const Task3 = ({ assignable, setAssignable, hotspotModels }: Task3Props) => {
  const [openTypeIndex, setOpenTypeIndex] = useState<number | null>(1); // State để lưu index của type đang mở
  const hotspotType = useSelector(
    (state: RootState) => state.data.hotspotTypes
  );

  const handleChooseType = (typeIndex: number) => {
    setOpenTypeIndex((prevIndex) =>
      prevIndex === typeIndex ? null : typeIndex
    );
  };

  return (
    <div className={`${styles.task3} ${styles.open_task3}`}>
      <div className="header" style={{ display: "flex", position: "relative" }}>
        <h3>3. Tạo điểm nhấn</h3>
        <select
          name=""
          id=""
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
          onChange={(e) => handleChooseType(Number(e.target.value))}
        >
          {hotspotType.map((type) => (
            <option value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>
      <TypeNavigation isOpenTypeNavigation={openTypeIndex == 1} />
      <TypeInfomation isOpenTypeInfomation={openTypeIndex == 2} />
      <TypeModel
        isOpenTypeModel={openTypeIndex == 4}
        hotspotModels={hotspotModels}
        assignable={assignable}
        setAssignable={setAssignable}
      />
    </div>
  );
};
export default Task3;
