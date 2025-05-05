import styles from "../../../styles/tasklistCT/task2.module.css";
// Tuỳ chỉnh thông số kỹ thuật.
interface Task2Props {
  isOpen2: boolean;
  angle: number;
  setAngle: (angle: number) => void;
  lightIntensity: number;
  setLightIntensity: (lightIntensity: number) => void;
  autoRotate: boolean;
  setAutoRotate: (autoRotate: boolean) => void;
  speedRotate: number;
  setSpeedRotate: (speedRotate: number) => void;
}
const Task2 = ({
  isOpen2,
  angle,
  setAngle,
  lightIntensity,
  setLightIntensity,
  autoRotate,
  setAutoRotate,
  speedRotate,
  setSpeedRotate,
}: Task2Props) => (
  <div className={styles.task2}>
    <h3>2. Thông số không gian</h3>
    <div className={styles.contain_input}>
      <label className={styles.label}>Hướng nhìn mặc định:</label>
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={angle}
        className={styles.name_input}
        placeholder="Hướng nhìn"
        onChange={(e) => setAngle(Number(e.target.value))}
      />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Độ dịch chuyển:</label>
      <input type="range" className={styles.name_input} />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Ánh sáng:</label>
      <input
        type="range"
        min="1"
        max="8"
        step="0.1"
        value={lightIntensity}
        onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
      />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Tự động xoay:</label>
      <input
        type="checkbox"
        checked={autoRotate} // Thiết lập giá trị checked cho checkbox
        onChange={(e) => setAutoRotate(e.target.checked)} // Cập nhật autoRotate
      />
    </div>
    {autoRotate ? (
      <div className={styles.contain_input}>
        <label className={styles.label}>Tốc độ xoay:</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={speedRotate}
          onChange={(e) => setSpeedRotate(parseFloat(e.target.value))}
        />
      </div>
    ) : (
      ""
    )}
    <div className={styles.contain_input}>
      <label className={styles.label}>Độ phóng to:</label>
      <input type="range" />
    </div>
  </div>
);
export default Task2;
