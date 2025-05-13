import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";
import { HotspotType } from "../../../redux/slices/HotspotSlice";
import styles from "../../../styles/tasklistCT/task3.module.css";

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
  setCurrentPoints,
  setChooseCornerMediaPoint,
  setCurrentHotspotType,
}: TypeMediaProps) => {
  const [videoMode, setVideoMode] = useState(false);
  const [typeFrame, setTypeFrame] = useState(0);

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
        </>
      )}
    </div>
  );
};

export default TypeMedia;