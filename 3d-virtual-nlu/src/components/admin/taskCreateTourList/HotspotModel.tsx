import {
  HotspotType,
  updateHotspotModel,
} from "../../../redux/slices/HotspotSlice";
import UploadFile from "../UploadFile";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";

interface TypeModelProps {
  isOpenTypeModel?: boolean;
  assignable?: boolean;
  setAssignable?: (value: boolean) => void;
  hotspotModel: any;
  setCurrentHotspotType?: (value: HotspotType) => void;
}

// Component cho Task5
const TypeModel = ({
  isOpenTypeModel,
  setAssignable,
  hotspotModel,
  // setHotspotModels,
  setCurrentHotspotType,
}: TypeModelProps) => {
  const [modelUrl, setModelUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    setModelUrl(hotspotModel.modelUrl);
    setName(hotspotModel.name);
    setDescription(hotspotModel.description);
  }, [hotspotModel]);

  const handleUpdateModel = () => {
    dispatch(
      updateHotspotModel({
        hotspotId: hotspotModel.id,
        modelUrl,
        name,
        description,
      })
    );
  };

  const handleUploadedFile = (url: string) => {
    setModelUrl(url);
  };

  return (
    <div
      className={`${styles.type_model} ${
        isOpenTypeModel ? styles.open_type_model : ""
      }`}
    >
      <div style={{ height: "75%", overflowY: "auto" }}>
        <p>
          <span style={{ color: "pink" }}> {hotspotModel?.positionX} </span>
          <span style={{ color: "yellow" }}> {hotspotModel?.positionY} </span>
          <span style={{ color: "lightblue" }}>
            {" "}
            {hotspotModel?.positionZ}{" "}
          </span>
        </p>
        <div style={{ display: "flex" }}>
          <label className={styles.label}>Tệp mô hình:</label>
          <UploadFile
            className="upload_model"
            hotspotId={hotspotModel?.id}
            onUploaded={handleUploadedFile}
          />
        </div>
        <div style={{ display: "flex" }}>
          <label className={styles.label}>Tên mô hình:</label>
          <input
            type="text"
            name=""
            id=""
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div style={{ display: "flex" }}>
          <label className={styles.label}>Mô tả:</label>
          <textarea
            name=""
            id=""
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </div>
      </div>
      <button onClick={() => handleUpdateModel()}>Cập nhật</button>
    </div>
  );
};

export default TypeModel;
