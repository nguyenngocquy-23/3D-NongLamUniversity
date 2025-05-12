import * as THREE from "three";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../../styles/createTourStep2.module.css";
import { FaClock } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import { FaHome } from "react-icons/fa";
import axios from "axios";
import UploadFile from "../UploadFile";
import { useRaycaster } from "../../../hooks/useRaycaster";

interface Task3Props {
  isOpen3: boolean;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModelCreateRequest[];
  setHotspotModels: (value: HotspotModelCreateRequest[]) => void;
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  videoMeshes: HotspotMediaCreateRequest[]; // danh sách mesh đã xong
  setVideoMeshes: (val: any) => void;
  cornerPointes: CornerPoint[]; // danh sách mesh đã xong
  setCornerPointes: (val: any) => void;
}

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
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  videoMeshes: HotspotMediaCreateRequest[]; // danh sách mesh đã xong
  setVideoMeshes: (val: HotspotMediaCreateRequest[]) => void;
  cornerPointes: CornerPoint[]; // danh sách mesh đã xong
  setCornerPointes: (val: any) => void;
}

export interface HotspotMediaCreateRequest {
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  mediaType: string;
  mediaUrl: string;
  caption: string;
  cornerPointList: string;
}

export interface CornerPoint {
  id: string; // id cho mỗi mesh
  points: [number, number, number][]; // danh sách điểm của mesh
  mediaUrl: string; // url tệp
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
  cornerPointes,
  setCornerPointes,
}: TypeMediaProps) => {
  const [videoMode, setVideoMode] = useState(false);
  const [typeFrame, setTypeFrame] = useState(0);

  const handlePointChange = (
    meshIndex: number,
    pointIndex: number,
    coordIndex: number,
    newValue: number
  ) => {
    setCornerPointes((prevMeshes: any) => {
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

  // const handleUploadVideo = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   meshIndex: number
  // ) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const videoUrl = URL.createObjectURL(file); // tạo URL tạm thời từ file local

  //   setVideoMeshes((prevMeshes: any) => {
  //     const updated = [...prevMeshes];
  //     const mesh = { ...updated[meshIndex] };
  //     mesh.videoUrl = videoUrl; // gán videoUrl mới
  //     updated[meshIndex] = mesh;
  //     return updated;
  //   });
  // };

  // cần interrface
  const handleUploadedFile = (url: string, index: number) => {
    const updated = [...cornerPointes];
    updated[index].mediaUrl = url;
    setCornerPointes(updated);
    const mediaMesh = [...videoMeshes];
    mediaMesh[index].mediaUrl = url;
    setVideoMeshes(mediaMesh);
    console.log("mediaMesh...", mediaMesh);
  };

  const handleUpMedia = async () => {
    console.log("videoMeshes", videoMeshes);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/admin/hotspot/addMedia",
        videoMeshes,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.statusCode === 1000) {
        console.log("✅ Upload model thành công!", response.data);
      } else {
        console.warn("❌ Upload thất bại:", response.data.message);
      }
    } catch (error) {
      console.error("🚨 Lỗi khi gọi API:", error);
    }
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
          {cornerPointes.map((mesh, index) => (
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
                  {index + 1}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <label>File video:</label>
                  {/* <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleUploadVideo(e, index)}
                  /> */}
                  <UploadFile
                    className="upload_video"
                    index={index}
                    onUploaded={handleUploadedFile}
                  />
                </div>

                <button
                  onClick={() => {
                    setCornerPointes((prev: any) =>
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
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      if (newValue < point[0]) {
                        handlePointChange(index, pointIndex, 0, newValue);
                      }
                    }}
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

          <button onClick={() => handleUpMedia()}>Thiết lập</button>
          {/* <div style={{ display: "flex" }}>
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
          </div> */}
        </>
      )}
    </div>
  );
};

interface TypeModelProps {
  isOpenTypeModel: boolean;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModelCreateRequest[];
  setHotspotModels: (value: HotspotModelCreateRequest[]) => void;
}

export interface HotspotModelCreateRequest {
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

// Component cho Task5
const TypeModel = ({
  isOpenTypeModel,
  assignable,
  setAssignable,
  hotspotModels,
  setHotspotModels,
}: TypeModelProps) => {
  const handleUploadedFile = (url: string, index: number) => {
    const updated = [...hotspotModels];
    updated[index].modelUrl = url;
    setHotspotModels(updated); // nếu bạn có hàm setHotspotModels
  };

  const handleAssign = () => {
    setAssignable(true);
  };

  const handleUpModel = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/admin/hotspot/addModel",
        hotspotModels,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.statusCode === 1000) {
        console.log("✅ Upload model thành công!", response.data);
      } else {
        console.warn("❌ Upload thất bại:", response.data.message);
      }
    } catch (error) {
      console.error("🚨 Lỗi khi gọi API:", error);
    }
  };

  return (
    <div
      className={`${styles.type_model} ${
        isOpenTypeModel ? styles.open_type_model : ""
      }`}
    >
      // thay bằng component quản lý biểu tượng
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
      <div style={{ height: "75%", overflowY: "auto" }}>
        {hotspotModels.map((hpm, index) => (
          <div key={index + 1}>
            <div
              style={{
                display: "flex",
              }}
            >
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
                {index + 1}
              </div>
              <button
                onClick={() => {
                  const updated = hotspotModels.filter((_, i) => i !== index);
                  setHotspotModels(updated);
                }}
                style={{ color: "red", cursor: "pointer" }}
                title="Xóa mô hình này"
              >
                ❌
              </button>
            </div>
            <p>
              <span style={{ color: "pink" }}> {hpm.positionX} </span>
              <span style={{ color: "yellow" }}> {hpm.positionY} </span>
              <span style={{ color: "lightblue" }}> {hpm.positionZ} </span>
            </p>
            <div style={{ display: "flex" }}>
              <label className={styles.label}>Tệp mô hình:</label>
              <UploadFile
                className="upload_model"
                index={index}
                onUploaded={handleUploadedFile}
              />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => handleUpModel()}>Thiết lập</button>
    </div>
  );
};

const RaycastOnTask3 = ({
  // isActive,
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

// Component cho Task3
const Task3 = ({
  isOpen3,
  assignable,
  setAssignable,
  hotspotModels,
  setHotspotModels,
  chooseCornerMediaPoint,
  setChooseCornerMediaPoint,
  videoMeshes,
  currentPoints,
  setCurrentPoints,
  setVideoMeshes,
  cornerPointes,
  setCornerPointes,
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
        cornerPointes={cornerPointes}
        setCornerPointes={setCornerPointes}
      />
      <TypeModel
        isOpenTypeModel={openTypeIndex == 4}
        hotspotModels={hotspotModels}
        setHotspotModels={setHotspotModels}
        assignable={assignable}
        setAssignable={setAssignable}
      />
    </div>
  );
};

export default Task3;
