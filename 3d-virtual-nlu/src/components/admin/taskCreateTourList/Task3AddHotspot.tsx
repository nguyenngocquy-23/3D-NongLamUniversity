import * as THREE from "three";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { FaClock } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import { FaHome } from "react-icons/fa";
import axios from "axios";
import UploadFile from "../UploadFile";
import { useRaycaster } from "../../../hooks/useRaycaster";
import TypeNavigation from "./HotspotNavigation";
import {
  HotspotModel,
  HotspotType,
  updateModelHotspotModelUrl,
} from "../../../redux/slices/HotspotSlice";
import TypeInfomation from "./HotspotInformation";

interface VideoMesh {
  id: string;
  videoUrl: string;
  points: [number, number, number][];
}

interface Task3Props {
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModelCreateRequest[];
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  videoMeshes: VideoMesh[]; // danh sách mesh đã xong
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  setVideoMeshes: (val: any) => void;
  currentHotspotType: HotspotType | null;
  setCurrentHotspotType: (value: HotspotType) => void;
}

// Component cho Task3
const Task3 = ({
  assignable,
  setAssignable,
  hotspotModels,
  chooseCornerMediaPoint,
  setChooseCornerMediaPoint,
  videoMeshes,
  currentPoints,
  setCurrentPoints,
  setVideoMeshes,
  currentHotspotType,
  setCurrentHotspotType,
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
    <div className={styles.task3}>
      <div className={styles.select_header}>
        <select
          className={styles.select_type}
          onChange={(e) => handleChooseType(Number(e.target.value))}
        >
          {hotspotType.map((type) => (
            <option value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>
      <TypeNavigation
        isOpenTypeNavigation={openTypeIndex == 1}
        setAssignable={setAssignable}
        setCurrentHotspotType={setCurrentHotspotType}
      />

      <TypeInfomation
        isOpenTypeInfomation={openTypeIndex == 2}
        setAssignable={setAssignable}
        setCurrentHotspotType={setCurrentHotspotType}
      />
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
        // setHotspotModels={setHotspotModels}
        assignable={assignable}
        setAssignable={setAssignable}
        currentHotspotType={currentHotspotType}
        setCurrentHotspotType={setCurrentHotspotType}
      />
    </div>
  );
};

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
    setVideoMeshes((prevMeshes: any) => {
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

interface TypeModelProps {
  isOpenTypeModel: boolean;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModelCreateRequest[];
  // setHotspotModels: (value: HotspotModelCreateRequest[]) => void;
  currentHotspotType: HotspotType | null;
  setCurrentHotspotType: (value: HotspotType) => void;
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
  currentHotspotType,
  setCurrentHotspotType,
}: // hotspotModels,
// setHotspotModels,
TypeModelProps) => {
  const dispatch = useDispatch();

  // Lấy hotspot model từ Redux
  const hotspotModels = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter((h): h is HotspotModel => h.type === 4)
  );

  const handleUploadedFile = (url: string, index: number) => {
    const targetHotspot = hotspotModels[index];
    if (targetHotspot) {
      dispatch(
        updateModelHotspotModelUrl({
          id: targetHotspot.id,
          modelUrl: url,
        })
      );
    }
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
      <div>
        <label className={styles.label}>Vị trí mô hình:</label>
        <button
          onClick={() => {
            setAssignable(true);
            setCurrentHotspotType(4);
          }}
        >
          Chọn vị trí
        </button>
      </div>
      <div style={{ height: "75%", overflowY: "auto" }}>
        {hotspotModels.map((hpm, index) => (
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
              {index + 1}
            </div>
            <div>
              <label className={styles.label}>Biểu tượng:</label>
              <FaHome />
              <input type="checkbox" />
              <FaClock />
              <input type="checkbox" />
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

export default Task3;
