import { FaHome } from "react-icons/fa";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { FaClock } from "react-icons/fa6";
import { HotspotType } from "../../../redux/slices/HotspotSlice";

interface TypeNavigationProps {
  isOpenTypeNavigation: boolean;
  //test
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  currentHotspotType: HotspotType | null;
  setCurrentHotspotType: (value: HotspotType) => void;
}

const TypeNavigation = ({
  isOpenTypeNavigation,
  assignable,
  setAssignable,
  currentHotspotType,
  setCurrentHotspotType,
}: TypeNavigationProps) => (
  <div
    className={`${styles.type_navigation} ${
      isOpenTypeNavigation ? styles.open_type_navigation : ""
    }`}
  >
    <div className={styles.contain_input}>
      <label className={styles.label}>Biểu tượng:</label>
      <input type="checkbox" />
      <FaHome />
      <input type="checkbox" />
      <FaClock />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Điểm di chuyển:</label>
      <button
        onClick={() => {
          setAssignable(true);
          setCurrentHotspotType(1);
        }}
      >
        Chọn điểm di chuyển
      </button>
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
export default TypeNavigation;
