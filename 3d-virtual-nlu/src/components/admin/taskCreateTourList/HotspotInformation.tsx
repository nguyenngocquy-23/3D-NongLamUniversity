import styles from "../../../styles/tasklistCT/task3.module.css";
import {
  HotspotType,
  updateHotspotInformation,
} from "../../../redux/slices/HotspotSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Description from "../../Description";
import { RgbaColorPicker } from "react-colorful";
import { rgbaToString } from "../../../utils/TransformRgbaColor";
import { CiPickerHalf } from "react-icons/ci";
interface TypeInfomationProps {
  isOpenTypeInfomation?: boolean;
  setAssignable?: (value: boolean) => void;
  setCurrentHotspotType?: (value: HotspotType) => void;
  hotspotInfo: any;
}
/**
 * Icon
 */

// Component cho Type infomation
const TypeInfomation = ({
  isOpenTypeInfomation,
  hotspotInfo,
}: TypeInfomationProps) => {
  const [content, setContent] = useState("");
  const [backgroundColorContent, setBackgroundColorContent] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 255,
  });
  const [borderColorContent, setBorderColorContent] = useState("");
  const [borderSizeContent, setBorderSizeContent] = useState<number>(0);
  const [showPicker, setShowPicker] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setContent(hotspotInfo.content);
    setBackgroundColorContent(hotspotInfo.backgroundColorContent);
    setBorderColorContent(hotspotInfo.borderColorContent);
    setBorderSizeContent(hotspotInfo.borderSizeContent);
  }, [hotspotInfo]);

  const handleUpdateInfo = () => {
    dispatch(
      updateHotspotInformation({
        hotspotId: hotspotInfo.id,
        content,
        backgroundColorContent,
        borderColorContent,
        borderSizeContent,
      })
    );
  };

  return (
    <div
      className={`${styles.type_infomation} ${
        isOpenTypeInfomation ? styles.open_type_infomation : ""
      }`}
    >
      <div>
        <label className={styles.label}>Nội dung:</label>
        <Description
          value={content}
          onChange={(html) => {
            setContent(html);
          }}
        />
      </div>
      <div className={styles.bkg_features}>
        <label className={styles.label}>Nền nội dung:</label>
        <div className={styles.opacity_icon_content}>
          <div
            className={styles.label_bkg}
            style={{
              backgroundColor: rgbaToString(backgroundColorContent),
            }}
            onClick={() => setShowPicker((p) => !p)}
          >
            <CiPickerHalf />

            {showPicker && (
              <div className={styles.color_picker}>
                <RgbaColorPicker
                  color={backgroundColorContent}
                  onChange={setBackgroundColorContent}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.border_features}>
        <label className={styles.label}>Viền nội dung:</label>
        <div className={styles.color_icon_content}>
          <input
            type="color"
            name="head"
            id="bkg_preview"
            value={borderColorContent}
            onChange={(e) => setBorderColorContent(e.target.value)}
          />
          <input
            type="text"
            name=""
            id="bkg_text"
            style={{ color: `${borderColorContent}` }}
            value={borderColorContent}
            onChange={(e) => setBorderColorContent(e.target.value)}
            placeholder="HEX, RGB or HSL"
          />
        </div>
        <div className={styles.color_icon_content}>
          <input
            type="number"
            name=""
            id="border_size"
            min="0"
            max="5"
            step="0.2"
            style={{ color: `${borderColorContent}` }}
            value={borderSizeContent}
            onChange={(e) => setBorderSizeContent(Number(e.target.value))}
            placeholder="Kích thước"
          />
        </div>
      </div>

      <div className={styles.update_section}>
        <button
          onClick={() => handleUpdateInfo()}
          className={styles.update_btn}
        >
          Cập nhật
        </button>
      </div>
    </div>
  );
};
export default TypeInfomation;
