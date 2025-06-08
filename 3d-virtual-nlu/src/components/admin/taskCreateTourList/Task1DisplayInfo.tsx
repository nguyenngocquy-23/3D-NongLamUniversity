import { useDispatch, useSelector } from "react-redux";
import styles from "../../../styles/tasklistCT/task1.module.css";
import { RootState } from "../../../redux/Store";
import { updatePanoConfig } from "../../../redux/slices/PanoramaSlice";

const Task1 = () => {
  const dispatch = useDispatch();
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const currentPanorama = panoramaList.find((p) => p.id === currentSelectId);
  if (!currentPanorama) return null;

  const { name = "", description = "" } = currentPanorama.config ?? {};
  const handleChange = (field: "name" | "description", value: string) => {
    dispatch(
      updatePanoConfig({
        id: currentPanorama.id,
        config: { [field]: value },
      })
    );
  };
  return (
    <div className={styles.task1}>
      <div className={styles.contain_input}>
        <label className={styles.label}>Tên:</label>
        <input
          type="text"
          className={styles.name_input}
          placeholder="Tên không gian"
          value={name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      <div className={styles.contain_input}>
        <label className={styles.label}>Giới thiệu:</label>
        <textarea
          className={styles.descript_input}
          placeholder="Mô tả không gian.."
          value={description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
    </div>
  );
};

export default Task1;
