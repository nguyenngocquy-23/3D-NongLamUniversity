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
import SoundUpload from "./SoundUpload";

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
    setDuration(currentPanorama?.duration ?? "");
  }, [currentPanorama]);

  const [name, setName] = useState(currentPanorama?.name ?? "");
  const [description, setDescription] = useState(
    currentPanorama?.description ?? ""
  );
  const [duration, setDuration] = useState<number>(
    currentPanorama?.duration ?? 0
  );
  const [soundBackground, setSoundBackground] = useState<string | null>(currentPanorama?.soundBackground || "");

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const loadedVoices = speechSynthesis.getVoices();
      if (loadedVoices.length > 0) {
        setVoices(loadedVoices);
      }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  useEffect(() => {
    dispatch(
      updateAutoPanoConfig({
        id: currentPanorama.id,
        duration: duration,
        soundBackground: soundBackground || "",
      })
    );
  }, [duration, soundBackground]);

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
            max={30}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
      </div>
      <div className={styles.config_item}>
        <div className={styles.input_group}>
          <label className={styles.label}>Nhạc nền:</label>
          <SoundUpload setSoundBackground={setSoundBackground}/>
          <label className={styles.label}>Giọng nói:</label>
          <select
            className={styles.custom_select}
            onChange={(e) => {
              const voice = voices.find((v) => v.name === e.target.value);
              setSelectedVoice(voice || null);
            }}
          >
            <option value="">-- Chọn giọng đọc --</option>
            {voices.map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ConfigAutoTour;
