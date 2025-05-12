import { FaHome } from "react-icons/fa";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { FaClock } from "react-icons/fa6";
import { HotspotType } from "../../../redux/slices/HotspotSlice";
interface TypeInfomationProps {
  isOpenTypeInfomation: boolean;
  setAssignable: (value: boolean) => void;
  setCurrentHotspotType: (value: HotspotType) => void;
}

// Component cho Type infomation
const TypeInfomation = ({
  isOpenTypeInfomation,
  setAssignable,
  setCurrentHotspotType,
}: TypeInfomationProps) => (
  <div
    className={`${styles.type_infomation} ${
      isOpenTypeInfomation ? styles.open_type_infomation : ""
    }`}
  >
    <div>
      <label className={styles.label}>Biểu tượng:</label>
      <FaHome />
      <input type="checkbox" />
      <FaClock />
      <input type="checkbox" />
    </div>
    <div>
      <label className={styles.label}>Vị trí chú thích:</label>
      <button
        onClick={() => {
          setAssignable(true);
          setCurrentHotspotType(2);
        }}
      >
        Chọn vị trí
      </button>
    </div>
  </div>
);
export default TypeInfomation;
