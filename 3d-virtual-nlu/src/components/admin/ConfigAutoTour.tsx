import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import styles from "../../styles/configAutoTour.module.css";
import {
  BaseHotspot,
  updateConfigHotspot,
} from "../../redux/slices/HotspotSlice";
import {
  updateAutoPanoConfig,
  updatePanoConfig,
} from "../../redux/slices/PanoramaSlice";
import { FaX } from "react-icons/fa6";

/**
 *
 * Component cấu hình các thông số cơ bản của media
 * Các thông số chi tiết cho từng media nằm ở TypeMedia
 */
const ConfigAutoTour = ({
  setOpenConfigTour,
  propHotspot,
}: // onPropsChange,
{
  setOpenConfigTour: (open: boolean) => void;
  propHotspot?: any;
  // onPropsChange: (value: any) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { autoPanoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  const currentPanorama = autoPanoramaList.find(
    (pano) => pano.id == currentSelectId
  );

  useEffect(() => {
    setName(currentPanorama?.name ?? "");
    setDescription(currentPanorama?.description ?? "");
  }, [currentPanorama]);

  const [name, setName] = useState(currentPanorama?.name ?? "");
  const [description, setDescription] = useState(
    currentPanorama?.description ?? ""
  );
  const [duration, setDuration] = useState<number>(
    currentPanorama?.duration ?? 0
  );

  useEffect(() => {
    dispatch(
      updateAutoPanoConfig({
        id: currentPanorama.id,
        config: {
          name,
          description,
        },
        duration: duration,
      })
    );
  }, [name, description, duration]);

  return (
    <div className={styles.config_container}>
      <button
        className={styles.close_button}
        onClick={() => setOpenConfigTour(false)}
      >
        <FaX />
      </button>
      <div className={styles.config_item}>
        <div className={styles.input_group}>
          <label className={styles.label}>Tên node:</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên node"
          />
        </div>
        <div className={styles.input_group}>
          <label className={styles.label}>Mô tả:</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm mô tả chi tiết"
          />
        </div>
        <div className={styles.input_group}>
          <label className={styles.label}>Thời gian chờ (giây):</label>
          <input
            className={styles.input}
            type="number"
            min={5}
            max={10}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
      </div>
      <div className={styles.config_item}>
        <div className={styles.input_group}>
          <label className={styles.label}>Cầu hình ảnh:</label>
          <label className={styles.label}>Giọng nói:</label>
          <label className={styles.label}>Điểm thông tin:</label>
          <label className={styles.label}>Mô hình:</label>
        </div>
      </div>
    </div>
  );
};

export default ConfigAutoTour;
