import { useDispatch, useSelector } from "react-redux";
import styles from "../../../styles/tasklistCT/task1.module.css";
import { RootState } from "../../../redux/Store";
import { updatePanoConfig } from "../../../redux/slices/PanoramaSlice";
import { useEffect, useState } from "react";
import Description from "../../Description";
import { FaQuestionCircle } from "react-icons/fa";

const Task1 = () => {
  const [content, setContent] = useState<string>("");

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
      <div className={styles.contain_input} style={{ display: "flex" }}>
        <label className={styles.label}>
          Tên:
          <FaQuestionCircle
            className={styles.guide_icon}
            title="Tên không được để trống và dưới 50 ký tự."
          />
        </label>
        <input
          type="text"
          className={`${styles.name_input} ${
            name.length > 50 || name.length == 0 ? styles.error : ""
          }`}
          placeholder="Tên không gian"
          value={name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      <div className={styles.descript_input}>
        <label className={styles.label}>Giới thiệu:</label>
        <textarea
          className={styles.textarea}
          value={description}
          rows={5}
          cols={40}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Thêm mô tả chi tiết"
        />
      </div>
    </div>
  );
};

export default Task1;
