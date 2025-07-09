import styles from "../../../styles/tasklistCT/task3.module.css";
import {
  HotspotType,
  updateHotspotInfomation,
} from "../../../redux/slices/HotspotSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Description from "../../Description";
interface TypeInfomationProps {
  isOpenTypeInfomation?: boolean;
  setAssignable?: (value: boolean) => void;
  setCurrentHotspotType?: (value: HotspotType) => void;
  hotspotInfo: any;
}

// Component cho Type infomation
const TypeInfomation = ({
  isOpenTypeInfomation,
  hotspotInfo,
}: TypeInfomationProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle(hotspotInfo.title);
    setContent(hotspotInfo.content);
  }, [hotspotInfo]);

  const handleUpdateInfo = () => {
    dispatch(
      updateHotspotInfomation({
        hotspotId: hotspotInfo.id,
        title,
        content,
      })
    );
  };

  return (
    <div
      className={`${styles.type_infomation} ${
        isOpenTypeInfomation ? styles.open_type_infomation : ""
      }`}
    >
      <div>
        <label className={styles.label}>Nội dung:</label>
        <Description
          value={content}
          onChange={(html) => {
            setContent(html);
          }}
        />
      </div>
      <button
        onClick={() => handleUpdateInfo()}
        style={{ padding: "0.5rem 1rem" }}
      >
        Cập nhật
      </button>
    </div>
  );
};
export default TypeInfomation;
