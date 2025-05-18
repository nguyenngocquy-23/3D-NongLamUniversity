import { useState } from "react";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import TypeNavigation from "./HotspotNavigation";
import { BaseHotspot, HotspotType } from "../../../redux/slices/HotspotSlice";
import ConfigIcon from "../ConfigIcon";
import ConfigMedia from "../ConfigMedia";

interface Task3Props {
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  currentPoints: [number, number, number][];
  setCurrentPoints: (val: any) => void;
  currentHotspotType: number;
  setCurrentHotspotType: (value: number) => void;
  onPropsChange: (value: BaseHotspot) => void;
}

// Component cho Task3
const Task3 = ({
  setAssignable,
  // setVideoMeshes,
  setCurrentHotspotType,
  onPropsChange,
}: Task3Props) => {
  const [openTypeIndex, setOpenTypeIndex] = useState<number>(1); // State để lưu index của type đang mở
  const hotspotType = useSelector(
    (state: RootState) => state.data.hotspotTypes
  );

  const handleChooseType = (typeIndex: number) => {
    setOpenTypeIndex(typeIndex);
  };

  return (
    <div className={styles.task3}>
      <div className={styles.select_header}>
        <select
          className={styles.select_type}
          onChange={(e) => handleChooseType(Number(e.target.value))}
        >
          {hotspotType.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
      {[1, 2, 4].includes(openTypeIndex) ? (
        <>
          <ConfigIcon
            onPropsChange={onPropsChange}
            currentHotspotType={openTypeIndex}
          />
          <label className={styles.label}>Chọn vị trí điểm:</label>
          <button
            onClick={() => {
              setAssignable(true);
              setCurrentHotspotType(openTypeIndex);
            }}
          >
            Chọn vị trí
          </button>
        </>
      ) : (
        /**
         * Xem xét có thể gộp chung với TypeMedia.tsx
         * tách để dễ phan biệt và giảm xử lý
         */
        <ConfigMedia
          setAssignable={setAssignable}
          onPropsChange={onPropsChange}
          currentHotspotType={openTypeIndex}
          setCurrentHotspotType={setCurrentHotspotType}
        />
      )}
    </div>
  );
};

export default Task3;
