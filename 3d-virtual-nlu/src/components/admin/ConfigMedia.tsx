import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import styles from "../../styles/tasklistCT/task3.module.css";
import {
  BaseHotspot,
  updateConfigHotspot,
} from "../../redux/slices/HotspotSlice";

/**
 *
 * Component cấu hình các thông số cơ bản của media
 * Các thông số chi tiết cho từng media nằm ở TypeMedia
 */
const ConfigMedia = ({
  propHotspot,
  isUpdate,
  onPropsChange,
  currentHotspotType,
  setAssignable,
  setCurrentHotspotType,
}: {
  propHotspot?: BaseHotspot;
  isUpdate?: boolean;
  onPropsChange: (value: BaseHotspot) => void;
  currentHotspotType?: number | null;
  setAssignable: (value: boolean) => void;
  setCurrentHotspotType: (value: number) => void;
}) => {
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  // Panorama hiện tại.
  const currentPanorama = panoramaList.find(
    (pano) => pano.id === currentSelectId
  );

  const hotspotTypes = useSelector(
    (state: RootState) => state.data.hotspotTypes
  );

  const icons = useSelector((state: RootState) => state.data.icons);

  const [iconId, setIconId] = useState(propHotspot?.iconId ?? 0);
  const iconUrl =
    iconId != 0
      ? icons.find((i) => i.id == iconId).url
      : icons.find(
          (i) =>
            i.id == hotspotTypes[(currentHotspotType ?? 1) - 1].defaultIconId
        ).url;

  const [scale, setScale] = useState(propHotspot?.scale ?? 1);
  const [pitchX, setPitchX] = useState(propHotspot?.pitchX ?? 0);
  const [yawY, setYawY] = useState(propHotspot?.yawY ?? 0);
  const [rollZ, setRollZ] = useState(propHotspot?.rollZ ?? 0);
  const [color, setColor] = useState(propHotspot?.color ?? "#333333");
  const [backgroundColor, setBackgroundColor] = useState(
    propHotspot?.backgroundColor ?? "#333333"
  );
  const [allowBackgroundColor, setAllowBackgroundColor] = useState(
    propHotspot?.allowBackgroundColor ?? false
  );
  const [opacity, setOpacity] = useState(propHotspot?.opacity ?? 1);

  const handleInitialHotspotProps = (): BaseHotspot => {
    return {
      id: "temp",
      nodeId: currentPanorama?.id ?? "",
      iconId:
        iconId !== 0 && propHotspot !== null
          ? iconId
          : hotspotTypes[(currentHotspotType ?? 1) - 1].defaultIconId,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      type: currentHotspotType ?? 1,
      scale,
      pitchX,
      yawY,
      rollZ,
      color,
      backgroundColor,
      allowBackgroundColor,
      opacity,
    };
  };

  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);

  const dispatch = useDispatch();

  const [typeFrame, setTypeFrame] = useState(0);

  useEffect(() => {
    if (propHotspot == null) {
      const props = handleInitialHotspotProps();
      setBasicProps(props);
      onPropsChange(props); // gọi hàm truyền lên component cha
    } else {
      const props = handleInitialHotspotProps();
      dispatch(
        updateConfigHotspot({
          hotspotId: propHotspot.id,
          propHotspot: props,
        })
      );
    }
  }, [
    currentHotspotType,
    currentPanorama,
    scale,
    pitchX,
    yawY,
    rollZ,
    color,
    backgroundColor,
    setAllowBackgroundColor,
    iconId,
  ]);

  return (
    <>
      <div style={{ display: "flex" }}>
        <label>Khung :</label>
        <div className={`${styles.frame} ${styles.plane_frame}`}>
          <input
            type="checkbox"
            value={"plane"}
            onChange={() => {
              setTypeFrame(0);
            }}
            checked={typeFrame === 0}
          />{" "}
          chu nhat
        </div>
        <div className={`${styles.frame} ${styles.circle_frame}`}>
          <input
            type="checkbox"
            value={"circle"}
            onChange={() => {
              setTypeFrame(1);
            }}
            checked={typeFrame === 1}
          />{" "}
          tron
        </div>
      </div>
      <div>
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex" }}>
              <label>Màu:</label>
              <input
                type="color"
                name=""
                id=""
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div style={{ display: "flex" }}>
              <label>Màu nền:</label>
              <input
                type="color"
                name=""
                id=""
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={!allowBackgroundColor ? true : false}
              />
              <button
                onClick={() => {
                  setAllowBackgroundColor((preState) => !preState);
                }} style={{
                padding: '0.5rem 1rem'
              }}
              >
                {allowBackgroundColor ? "Tắt" : "Bật"}
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <label>Độ to:</label>
          <div>
            <div>
              <input
                type="range"
                name="scale"
                id="scale"
                min={0.5}
                max={2}
                step={0.1}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
              <span>{Math.round(((scale - 0.5) / 1.5) * 100)}%</span>
            </div>
          </div>
        </div>

        {typeFrame == 0 ? (
          <button
            onClick={() => {
              setAssignable(true);
              // setCurrentPoints([]);
              setCurrentHotspotType(3);
            }}
              style={{
                padding: '0.5rem 1rem'
              }}
          >
            Chọn điểm
          </button>
        ) : (
          <button
            onClick={() => {
              setAssignable(true);
              // setCurrentPoints([]);
              setCurrentHotspotType(3);
            }}
          >
            Chọn tâm
          </button>
        )}
      </div>
    </>
  );
};

export default ConfigMedia;
