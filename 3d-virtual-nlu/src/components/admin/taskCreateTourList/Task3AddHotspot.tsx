import { useEffect, useState } from "react";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import {
  BaseHotspot,
  HotspotNavigation,
} from "../../../redux/slices/HotspotSlice";
import ConfigIcon from "../ConfigIcon";
import ConfigMedia from "../ConfigMedia";
import { PanoramaItem } from "../../../redux/slices/PanoramaSlice";
import { getFilteredHotspotNavigationById } from "../../../redux/slices/Selectors";

interface Task3Props {
  isAssignable: boolean;
  setAssignable: (value: boolean) => void;
  setCurrentHotspotType: (value: number) => void;
  onPropsChange: (value: BaseHotspot) => void;
  currentPanorama?: PanoramaItem;
  setValidIcon: (value: boolean) => void;
  limitNav: boolean;
}

// Component cho Task3
const Task3 = ({
  isAssignable,
  setAssignable,
  setCurrentHotspotType,
  onPropsChange,
  currentPanorama,
  setValidIcon,
  limitNav,
}: Task3Props) => {
  const [openTypeIndex, setOpenTypeIndex] = useState<number>(1); // State để lưu index của type đang mở
  const hotspotType = useSelector(
    (state: RootState) => state.data.hotspotTypes
  );
  const { panoramaList } = useSelector((state: RootState) => state.panoramas);

  const [currentHotspotData, setCurrentHotspotData] =
    useState<BaseHotspot | null>(null);

  const handlePropsChange = (data: BaseHotspot) => {
    setCurrentHotspotData(data);
  };

  const handleCombinedPropsChange = (data: BaseHotspot) => {
    onPropsChange(data);
    handlePropsChange(data);
  };

  const handleChooseType = (typeIndex: number) => {
    setOpenTypeIndex(typeIndex);
  };

  /**
   * Lấy ra danh sách hotspot navigation hiện tại của currentPanorama.
   */
  const hotspotNavigationFromNode = useSelector(
    getFilteredHotspotNavigationById(currentPanorama?.id || "")
  );
  /**
   * Tour sẽ có n (=n<6) panorama (max).
   * => Master Panorama có thể có n-1 hotspot navigation đến node con.
   * => Master Panorama có thể có nhiều các hotspot navigation sang các tour khác.
   * Các slave Panorama có tối đa 1 hotspot navigation đến node master.
   */
  const isMasterNode: boolean = currentPanorama?.config.status === 2;

  const limitNavigation = (
    isMaster = isMasterNode,
    quantity = panoramaList.length
  ) => {
    if (isMaster) return quantity - 1;
    return 1;
  };

  useEffect(() => {
    if (currentHotspotData) {
      console.log("🔍 currentHotspotData cập nhật:", currentHotspotData);
    }
  }, [currentHotspotData]);

  return (
    <div className={styles.task3}>
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

      {[1, 2, 4].includes(openTypeIndex) ? (
        <>
          <ConfigIcon
            onPropsChange={handleCombinedPropsChange}
            currentHotspotType={openTypeIndex}
          />
          <label className={styles.label}>Chọn vị trí điểm:</label>
          {limitNav &&
          hotspotNavigationFromNode.length >= limitNavigation() * 2 &&
          openTypeIndex == 1 ? (
            <span>Bạn đã đạt giới hạn.</span>
          ) : currentHotspotData !== null &&
            currentHotspotData.iconId === null ? (
            <button
              onClick={() => {
                setAssignable(!isAssignable);
                setCurrentHotspotType(openTypeIndex);
                setValidIcon(false);
              }}
              style={{
                padding: "0.5rem 1rem",
              }}
            >
              {isAssignable ? "Quay lại" : "Chọn vị trí"}
            </button>
          ) : (
            <button
              onClick={() => {
                setAssignable(!isAssignable);
                setCurrentHotspotType(openTypeIndex);
                setValidIcon(true);
              }}
              style={{
                padding: "0.5rem 1rem",
              }}
            >
              {isAssignable ? "Hủy" : "Chọn vị trí"}
            </button>
          )}
        </>
      ) : (
        /**
         * Xem xét có thể gộp chung với TypeMedia.tsx
         * tách để dễ phan biệt và giảm xử lý
         */
        <ConfigMedia
          setAssignable={setAssignable}
          onPropsChange={handleCombinedPropsChange}
          currentHotspotType={openTypeIndex}
          setCurrentHotspotType={setCurrentHotspotType}
        />
      )}
    </div>
  );
};

export default Task3;
