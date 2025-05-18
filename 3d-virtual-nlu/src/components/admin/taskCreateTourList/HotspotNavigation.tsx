import { FaHome } from "react-icons/fa";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { FaClock } from "react-icons/fa6";
import {
  HotspotType,
  updateNavigationHotspotTarget,
} from "../../../redux/slices/HotspotSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/Store";

interface TypeNavigationProps {
  hotspotId: string | null;
  isOpenTypeNavigation?: boolean;
  setAssignable?: (value: boolean) => void;
  setCurrentHotspotType?: (value: HotspotType) => void;
}

const TypeNavigation = ({
  hotspotId,
  isOpenTypeNavigation,
}: TypeNavigationProps) => {
  /**
   * Lấy ra danh sách panorama
   */
  const { hotspotList, panoramaList } = useSelector((state: RootState) => ({
    hotspotList: state.hotspots.hotspotList,
    panoramaList: state.panoramas.panoramaList,
  }));

  const currentHotspot = hotspotList.find((h) => h.id === hotspotId);
  const hotspotNode = panoramaList.find((p) => p.id === currentHotspot?.nodeId);
  const targetStatus = hotspotNode?.config.status === 1 ? 2 : 1;

  const filteredPanoramas = panoramaList.filter(
    (p) => p.config.status === targetStatus
  );

  const dispatch = useDispatch<AppDispatch>();
  return (
    <div
      className={`${styles.type_navigation} ${
        isOpenTypeNavigation ? styles.open_type_navigation : ""
      }`}
    >
      <div className={styles.contain_input}>
        <label className={styles.label}>Điểm di chuyển:</label>
        {/* <button
      // onClick={() => {
      //   setAssignable(true);
      //   setCurrentHotspotType(1);
      // }}
      >
        Chọn điểm di chuyển
      </button> */}

        <select
          onChange={(e) => {
            const selectedId = e.target.value;
            if (selectedId && hotspotId) {
              console.log("🔽 Đã chọn panorama:", selectedId);
              dispatch(
                updateNavigationHotspotTarget({
                  id: hotspotId,
                  targetNodeId: selectedId,
                })
              );
            }
          }}
        >
          <option value="">Chọn panorama</option>
          {filteredPanoramas.map((pano) => (
            <option key={pano.id} value={pano.id}>
              {pano.config.name || "null"}
            </option>
          ))}
        </select>
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
};
export default TypeNavigation;
