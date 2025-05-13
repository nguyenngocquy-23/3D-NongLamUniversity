import axios from "axios";
import { FaHome } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";
import { HotspotType } from "../../../redux/slices/HotspotSlice";
import UploadFile from "../UploadFile";
import styles from "../../../styles/tasklistCT/task3.module.css";

interface TypeModelProps {
  isOpenTypeModel: boolean;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModelCreateRequest[];
  // setHotspotModels: (value: HotspotModelCreateRequest[]) => void;
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
  hotspotModels,
  // setHotspotModels,
  setCurrentHotspotType
}: TypeModelProps) => {
  // const handleUploadedFile = (url: string, index: number) => {
  //   const updated = [...hotspotModels];
  //   updated[index].modelUrl = url;
  //   setHotspotModels(updated); // nếu bạn có hàm setHotspotModels
  // };

  // const handleAssign = () => {
  //   setAssignable(true);
  // };

  // const handleUpModel = async () => {
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:8080/api/v1/admin/hotspot/addModel",
  //       hotspotModels,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.data.statusCode === 1000) {
  //       console.log("✅ Upload model thành công!", response.data);
  //     } else {
  //       console.warn("❌ Upload thất bại:", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("🚨 Lỗi khi gọi API:", error);
  //   }
  // };
  
  return (
    <div
      className={`${styles.type_model} ${
        isOpenTypeModel ? styles.open_type_model : ""
      }`}
    >
      // thay bằng component quản lý biểu tượng
      
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
                // onUploaded={handleUploadedFile}
              />
            </div>
          </div>
        ))}
      </div>
      {/* <button onClick={() => handleUpModel()}>Thiết lập</button> */}
    </div>
  );
};

export default TypeModel;