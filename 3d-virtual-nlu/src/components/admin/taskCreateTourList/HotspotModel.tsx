import { HotspotType } from "../../../redux/slices/HotspotSlice";
import UploadFile from "../UploadFile";
import styles from "../../../styles/tasklistCT/task3.module.css";

interface TypeModelProps {
  isOpenTypeModel?: boolean;
  assignable?: boolean;
  setAssignable?: (value: boolean) => void;
  hotspotModels?: HotspotModelCreateRequest[];
  // setHotspotModels: (value: HotspotModelCreateRequest[]) => void;
  setCurrentHotspotType?: (value: HotspotType) => void;
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
  setAssignable,
  hotspotModels,
  // setHotspotModels,
  setCurrentHotspotType,
}: TypeModelProps) => {
  return (
    <div
      className={`${styles.type_model} ${
        isOpenTypeModel ? styles.open_type_model : ""
      }`}
    >
      <div style={{ height: "75%", overflowY: "auto" }}>
        {/* {hotspotModels.map((hpm, index) => (
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
                  // setHotspotModels(updated);
                }}
                style={{ color: "red", cursor: "pointer" }}
                title="Xóa mô hình này"
              >
                Xoá
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
                // onUploaded={handleUploadedFile}
              />
            </div>
          </div>
        ))} */}
        <p>
          {/* <span style={{ color: "pink" }}> {hpm.positionX} </span>
              <span style={{ color: "yellow" }}> {hpm.positionY} </span>
              <span style={{ color: "lightblue" }}> {hpm.positionZ} </span> */}
        </p>
        <div style={{ display: "flex" }}>
          <label className={styles.label}>Tệp mô hình:</label>
          <UploadFile
            className="upload_model"
            // index={index}
            // onUploaded={handleUploadedFile}
          />
        </div>
      </div>
      {/* <button onClick={() => handleUpModel()}>Thiết lập</button> */}
    </div>
  );
};

export default TypeModel;
