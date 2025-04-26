import * as THREE from "three";
import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { Line, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import RaycasterHandler from "../../components/visitor/RaycasterHandler";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import { useRaycaster } from "../../hooks/useRaycaster";
import PointMedia from "../../components/admin/PointMedia";

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
interface VideoMesh {
  id: string;
  videoUrl: string;
  points: [number, number, number][];
}

interface Task3Props {
  isOpen3: boolean;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModel[];
  setHotspotModels: (value: HotspotModel[]) => void;
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  videoMeshes: VideoMesh[]; // danh sách mesh đã xong
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  setVideoMeshes: (val: any) => void;
}

// Component cho Task3
const Task3 = ({
  isOpen3,
  assignable,
  setAssignable,
  hotspotModels,
  chooseCornerMediaPoint,
  setChooseCornerMediaPoint,
  videoMeshes,
  currentPoints,
  setCurrentPoints,
  setVideoMeshes,
}: Task3Props) => {
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
    <div className={`${styles.task3} ${isOpen3 ? styles.open_task3 : ""}`}>
      <div className="header" style={{ display: "flex", position: "relative" }}>
        <h3>3. Tạo điểm tương tác</h3>
        <select
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
      <TypeMedia
        isOpenTypeMedia={openTypeIndex == 3}
        currentPoints={currentPoints}
        videoMeshes={videoMeshes}
        setCurrentPoints={setCurrentPoints}
        setVideoMeshes={setVideoMeshes}
        chooseCornerMediaPoint={chooseCornerMediaPoint}
        setChooseCornerMediaPoint={setChooseCornerMediaPoint}
      />
      <TypeModel
        isOpenTypeModel={openTypeIndex == 4}
        hotspotModels={hotspotModels}
        assignable={assignable}
        setAssignable={setAssignable}
      />
    </div>
  );
};
interface TypeNavigationProps {
  isOpenTypeNavigation: boolean;
}

// Component cho type navigation
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

// Component cho Type infomation
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

interface TypeMediaProps {
  isOpenTypeMedia: boolean;
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  videoMeshes: VideoMesh[]; // danh sách mesh đã xong
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  setVideoMeshes: (val: any) => void;
}

// Component cho Type media
const TypeMedia = ({
  isOpenTypeMedia,
  videoMeshes,
  currentPoints,
  setCurrentPoints,
  setVideoMeshes,
  chooseCornerMediaPoint,
  setChooseCornerMediaPoint,
}: TypeMediaProps) => {
  const [videoMode, setVideoMode] = useState(false);
  const [typeFrame, setTypeFrame] = useState(0);

  const handlePointChange = (
    meshIndex: number,
    pointIndex: number,
    coordIndex: number,
    newValue: number
  ) => {
    setVideoMeshes((prevMeshes) => {
      const updated = [...prevMeshes]; // clone mảng chính
      const updatedMesh = { ...updated[meshIndex] }; // clone object mesh
      const updatedPoints = [...updatedMesh.points]; // clone danh sách points
      const updatedPoint = [...updatedPoints[pointIndex]]; // clone 1 point

      updatedPoint[coordIndex] = newValue; // chỉnh 1 toạ độ

      updatedPoints[pointIndex] = updatedPoint; // gán lại point
      updatedMesh.points = updatedPoints; // gán lại points
      updated[meshIndex] = updatedMesh; // gán lại mesh vào danh sách

      return updated;
    });
  };

  const handleUploadVideo = (
    e: React.ChangeEvent<HTMLInputElement>,
    meshIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const videoUrl = URL.createObjectURL(file); // tạo URL tạm thời từ file local

    setVideoMeshes((prevMeshes: any) => {
      const updated = [...prevMeshes];
      const mesh = { ...updated[meshIndex] };
      mesh.videoUrl = videoUrl; // gán videoUrl mới
      updated[meshIndex] = mesh;
      return updated;
    });
  };

  return (
    <div
      className={`${styles.type_media} ${
        isOpenTypeMedia ? styles.open_type_media : ""
      }`}
    >
      <div className="mode">
        <button
          className={`${styles.mode_button} ${videoMode ? "" : styles.choosed}`}
          onClick={() => setVideoMode(false)}
        >
          Ảnh
        </button>
        <button
          className={`${styles.mode_button} ${videoMode ? styles.choosed : ""}`}
          onClick={() => setVideoMode(true)}
        >
          Video
        </button>
      </div>
      {!videoMode ? (
        <>
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
        </>
      ) : (
        <>
          <div style={{ display: "inline-flex" }}>
            <label className={styles.label}>Khung video:</label>
            <div className={`${styles.frame} ${styles.plane_frame}`}>
              <input
                type="checkbox"
                value={"plane"}
                onChange={() => {
                  setTypeFrame(0);
                }}
                checked={typeFrame === 0}
              />{" "}
              chu nhat
            </div>
            <div className={`${styles.frame} ${styles.circle_frame}`}>
              <input
                type="checkbox"
                value={"circle"}
                onChange={() => {
                  setTypeFrame(1);
                }}
                checked={typeFrame === 1}
              />{" "}
              tron
            </div>
          </div>
          <div>
            <label className={styles.label}>Vị trí:</label>
            <button
              onClick={() => {
                setCurrentPoints([]);
                setChooseCornerMediaPoint(true);
              }}
            >
              Chọn điểm
            </button>
          </div>
          {videoMeshes.map((mesh, index) => (
            <div
              key={index}
              style={{
                marginBottom: "1rem",
                height: "100px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: 0 }}>Mesh {index + 1}</h4>
                <div>
                  <label className={styles.label}>File video:</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleUploadVideo(e, index)}
                  />
                </div>

                <button
                  onClick={() => {
                    setVideoMeshes((prev: any) =>
                      prev.filter((_: any, i: any) => i !== index)
                    );
                  }}
                  style={{ color: "red", cursor: "pointer" }}
                >
                  ❌
                </button>
              </div>

              {mesh.points.map((point, pointIndex) => (
                <div key={pointIndex}>
                  <label>Điểm {pointIndex + 1}:</label>
                  <input
                    type="number"
                    value={point[0]}
                    onChange={(e) =>
                      handlePointChange(
                        index,
                        pointIndex,
                        0,
                        parseFloat(e.target.value)
                      )
                    }
                  />
                  <input
                    type="number"
                    value={point[1]}
                    onChange={(e) =>
                      handlePointChange(
                        index,
                        pointIndex,
                        1,
                        parseFloat(e.target.value)
                      )
                    }
                  />
                  <input
                    type="number"
                    value={point[2]}
                    onChange={(e) =>
                      handlePointChange(
                        index,
                        pointIndex,
                        2,
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ))}

          <div style={{ display: "flex" }}>
            <label className={styles.label}>Cấu hình video:</label>
            <div className="config_box">
              <label>Xoay ngang</label>
              <input type="range" name="" id="" /> <br />
              <label>Xoay dọc</label>
              <input type="range" name="" id="" /> <br />
              <label>Tự động mở</label>
              <input type="checkbox" name="" id="" /> <br />
              <label>Tắt tiếng</label>
              <input type="checkbox" name="" id="" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

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
        <button
          onClick={() => {
            setAssignable(true);
          }}
        >
          Chọn vị trí
        </button>
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

const RaycastOnTask3 = ({
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
        }
        5;
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

interface VideoMeshProps {
  cornerPoints: any[];
  currentVideoUrl: string;
  setCornerPoints: React.Dispatch<
    React.SetStateAction<[number, number, number][]>
  >;
  setChooseCornerMediaPoint: (value: boolean) => void;
}

const VideoMeshComponent = ({
  cornerPoints,
  currentVideoUrl,
  setCornerPoints,
  setChooseCornerMediaPoint,
}: VideoMeshProps) => {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

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

  // point used for upload media feature
  interface VideoMesh {
    id: string; // id cho mỗi mesh
    videoUrl: string; // url video
    points: [number, number, number][]; // danh sách điểm của mesh
  }

  const [videoMeshes, setVideoMeshes] = useState<VideoMesh[]>([]);

  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");

  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");

  const handleAddPoint = (point: [number, number, number]) => {
    const newPoints = [...currentPoints, point];
    setCurrentPoints(newPoints);

    if (newPoints.length === 4) {
      const newMesh: VideoMesh = {
        id: Date.now().toString(), // Hoặc dùng uuid nếu muốn đẹp hơn
        videoUrl: selectedVideoUrl, // Giả sử bạn có biến lưu url video đang chọn
        points: newPoints,
      };

      setVideoMeshes((prev) => [...prev, newMesh]);
      setCurrentPoints([]); // reset để bắt đầu chọn 4 điểm mới
      setChooseCornerMediaPoint(false); // tắt chế độ chọn
    }
  };

  // hostpost model
  type HotspotModel = {
    id: number;
    position: [number, number, number];
    modelURL?: string; // model gán vào hotspot
    assigned?: boolean; // đã gán mô hình chưa
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
  const [chooseCornerMediaPoint, setChooseCornerMediaPoint] = useState(false);

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
      <div className={styles.preview_tour}>
        {/* main - canvas */}
        {/* <Canvas
          camera={{
            fov: 75,
            position: cameraPosition,
            aspect: window.innerWidth / window.innerHeight,
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          // style={{ cursor: cursor }}
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

          {/* {sphereRef.current && (
            <RaycasterHandler
              sphereRef={sphereRef}
              onAddHotspot={handleAddHotspot}
              hoveredHotspot={hoveredHotspot} //test
              switchTexture={handledSwitchTexture}
            />
          )} */}

          <RaycastOnTask3
            isActive={openTaskIndex === 3}
            onAddHotspot={handleAddHotspot}
            sphereRef={sphereRef}
            assignable={assignable}
            setAssignable={setAssignable}
          />
          {/* {hotspots.map((hotspot) => (
            <GroundHotspot
              key={hotspot.id}
              position={hotspot.position}
              setHoveredHotspot={setHoveredHotspot}
            />
          ))} */}
          {hotspotModels.map((hotspot) => (
            <GroundHotspotModel
              key={hotspot.id}
              position={hotspot.position}
              setHoveredHotspot={setHoveredHotspot}
            />
          ))}
<!--         <div>
        <VirtualTour textureUrl={currentPanoramaUrl} />
        </div> -->
          <RaycastOnMedia
            isActive={chooseCornerMediaPoint}
            onAddPoint={handleAddPoint}
            sphereRef={sphereRef}
            cornerPoints={currentPoints} // 🆕 truyền vào để kiểm soát số lượng
          />

          {videoMeshes.map((mesh, index) => (
            <VideoMeshComponent
              key={mesh.id}
              cornerPoints={mesh.points}
              currentVideoUrl={mesh.videoUrl}
              setCornerPoints={() => {}} // không cần nếu mesh đã xong
              setChooseCornerMediaPoint={() => {}} // không cần nếu mesh đã xong
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
              <span className={styles.task_name}>Tạo điểm nhấn</span>
            </li>
          </ul>
          <button className={styles.done_button} onClick={handleDoneStep2}>
            Tiếp tục
          </button>
        </div>

        {/* Box chứa node */}
        <div className={styles.nodeThumbn}>
          {/* list node */}
          <div className={styles.node}>
            <div className={styles.node_view}></div>
            <span>Name</span>
          </div>
          <div className={styles.node}>
            <div className={styles.node_view}></div>
            <span>Name</span>
          </div>
          <div className={styles.add_node_button}>
            <FaPlus />
          </div>
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
          videoMeshes={videoMeshes} // danh sách các mesh đã hoàn tất
          currentPoints={currentPoints} // mesh đang chọn
          setCurrentPoints={setCurrentPoints} // thêm điểm
          setVideoMeshes={setVideoMeshes} // cập nhật danh sách mesh
          assignable={assignable}
          setAssignable={setAssignable}
          chooseCornerMediaPoint={chooseCornerMediaPoint}
          setChooseCornerMediaPoint={setChooseCornerMediaPoint}
        />
        {/* <Task4 isOpen4={openTaskIndex === 4} />
        <Task5
          isOpen5={openTaskIndex === 5}
          hotspotModels={hotspotModels}
          assignable={assignable}
          setAssignable={setAssignable}
        /> */}
      </div>
    </>
  );
};

export default CreateTourStep2;
