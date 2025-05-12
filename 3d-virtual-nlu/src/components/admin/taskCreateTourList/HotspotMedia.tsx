import axios from "axios";
import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";
import { HotspotType } from "../../../redux/slices/HotspotSlice";
import UploadFile from "../UploadFile";
import styles from "../../../styles/tasklistCT/task3.module.css";

interface TypeMediaProps {
  isOpenTypeMedia: boolean;
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  videoMeshes: HotspotMediaCreateRequest[]; // danh sách mesh đã xong
  setVideoMeshes: (val: HotspotMediaCreateRequest[]) => void;
//   cornerPointes: CornerPoint[]; // danh sách mesh đã xong
//   setCornerPointes: (val: any) => void;
}

export interface CornerPoint {
  id: string; // id cho mỗi mesh
  points: [number, number, number][]; // danh sách điểm của mesh
  mediaUrl: string; // url tệp
}

interface TypeMediaProps {
  isOpenTypeMedia: boolean;
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  setAssignable: (value: boolean) => void;
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  videoMeshes: HotspotMediaCreateRequest[]; // danh sách mesh đã xong
  setVideoMeshes: (val: HotspotMediaCreateRequest[]) => void;
//   cornerPointes: CornerPoint[]; // danh sách mesh đã xong
//   setCornerPointes: (val: any) => void;
  setCurrentHotspotType: (value: HotspotType) => void;
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
  setAssignable,
  videoMeshes,
  currentPoints,
  setCurrentPoints,
  setVideoMeshes,
  chooseCornerMediaPoint,
  setChooseCornerMediaPoint,
//   cornerPointes,
//   setCornerPointes,
  setCurrentHotspotType,
}: TypeMediaProps) => {
  const [videoMode, setVideoMode] = useState(false);
  const [typeFrame, setTypeFrame] = useState(0);

//   const handlePointChange = (
//     meshIndex: number,
//     pointIndex: number,
//     coordIndex: number,
//     newValue: number
//   ) => {
//     setCornerPointes((prevMeshes: any) => {
//       const updated = [...prevMeshes]; // clone mảng chính
//       const updatedMesh = { ...updated[meshIndex] }; // clone object mesh
//       const updatedPoints = [...updatedMesh.points]; // clone danh sách points
//       const updatedPoint = [...updatedPoints[pointIndex]]; // clone 1 point

//       updatedPoint[coordIndex] = newValue; // chỉnh 1 toạ độ

//       updatedPoints[pointIndex] = updatedPoint; // gán lại point
//       updatedMesh.points = updatedPoints; // gán lại points
//       updated[meshIndex] = updatedMesh; // gán lại mesh vào danh sách

//       return updated;
//     });
//   };

//   // cần interrface
//   const handleUploadedFile = (url: string, index: number) => {
//     const updated = [...cornerPointes];
//     updated[index].mediaUrl = url;
//     setCornerPointes(updated);
//     const mediaMesh = [...videoMeshes];
//     mediaMesh[index].mediaUrl = url;
//     setVideoMeshes(mediaMesh);
//     console.log("mediaMesh...", mediaMesh);
//   };

//   const handleUpMedia = async () => {
//     console.log("videoMeshes", videoMeshes);
//     try {
//       const response = await axios.post(
//         "http://localhost:8080/api/v1/admin/hotspot/addMedia",
//         videoMeshes,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.statusCode === 1000) {
//         console.log("✅ Upload model thành công!", response.data);
//       } else {
//         console.warn("❌ Upload thất bại:", response.data.message);
//       }
//     } catch (error) {
//       console.error("🚨 Lỗi khi gọi API:", error);
//     }
//   };

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
                setAssignable(true);
                setCurrentPoints([]);
                setChooseCornerMediaPoint(true);
                setCurrentHotspotType(3);
              }}
            >
              Chọn điểm
            </button>
          </div>
          {/* {cornerPointes.map((mesh, index) => (
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
          ))} */}

          {/* <button onClick={() => handleUpMedia()}>Thiết lập</button> */}
        </>
      )}
    </div>
  );
};

export default TypeMedia;