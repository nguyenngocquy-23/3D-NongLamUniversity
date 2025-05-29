import { FaHome } from "react-icons/fa";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { FaClock } from "react-icons/fa6";
import {
  HotspotType,
  updateNavigationHotspotTarget,
} from "../../../redux/slices/HotspotSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/Store";
import {
  getFilteredHotspotNavigationById,
  getListTargetNodeFromUpdateHotspotNavigation,
} from "../../../redux/slices/Selectors";

interface TypeNavigationProps {
  hotspotId: string;
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
  const hotspotList = useSelector((state: RootState) => state.hotspots);

  const { panoramaList } = useSelector((state: RootState) => state.panoramas);

  const currentHotspot = hotspotList.hotspotList.find(
    (h) => h.id === hotspotId
  );
  /**
   * Truyền vào Id hotspot => Tìm được hotspot hiện tại.
   * Từ hotspot hiện tại thì mình tìm được Node chứa hotspot đấy, kiểm tra xem nó có trạng thái là master hay slave.
   * => Lấy được danh sách các targetNode chưa được thêm (chọn targetNode cho hotspot)
   */
  const hotspotNode = panoramaList.find((p) => p.id === currentHotspot?.nodeId);

  const targetStatus = hotspotNode?.config.status === 1 ? 2 : 1;

  const filteredPanoramas = useSelector(
    getListTargetNodeFromUpdateHotspotNavigation(hotspotId)
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
          {filteredPanoramas?.map((pano) => (
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
