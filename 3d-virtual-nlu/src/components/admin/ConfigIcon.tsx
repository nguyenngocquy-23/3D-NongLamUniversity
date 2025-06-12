import { useEffect, useMemo, useRef, useState } from "react";
import ListIcon from "./ListIcon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { Canvas } from "@react-three/fiber";
import HotspotPreview from "./taskCreateTourList/HotspotPreview";
import {
  BaseHotspot,
  updateConfigHotspot,
} from "../../redux/slices/HotspotSlice";
import styles from "../../styles/configIcon.module.css";
import { FiEdit } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import { FaArrowRotateLeft } from "react-icons/fa6";

const ConfigIcon = ({
  propHotspot,
  isUpdate,
  onPropsChange,
  currentHotspotType,
}: {
  propHotspot?: BaseHotspot;
  isUpdate?: boolean;
  onPropsChange: (value: BaseHotspot) => void;
  currentHotspotType: number | null;
}) => {
  const [openListIcon, setOpenListIcon] = useState(false);

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
  const [isFloor, setIsFloor] = useState(false);
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

  useEffect(() => {
    if (propHotspot == null) {
      const props = handleInitialHotspotProps();
      // setBasicProps(props);
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
    opacity,
    pitchX,
    yawY,
    rollZ,
    color,
    backgroundColor,
    setAllowBackgroundColor,
    iconId,
  ]);

  /**
   * useEffect để khi propHotspot có thay đổi thì các state sẽ duoc set lại
   * Nếu không useEffect thì khi ở trong component khác thay đổi propHotspot
   * Nghĩa là update lại component này thì các state vẫn giữ nguyên
   */
  useEffect(() => {
    if (propHotspot) {
      setIconId(propHotspot.iconId ?? 0);
      setScale(propHotspot.scale ?? 1);
      setPitchX(propHotspot.pitchX ?? 0);
      setYawY(propHotspot.yawY ?? 0);
      setRollZ(propHotspot.rollZ ?? 0);
      setColor(propHotspot.color ?? "#333333");
      setBackgroundColor(propHotspot.backgroundColor ?? "#333333");
      setAllowBackgroundColor(propHotspot.allowBackgroundColor ?? false);
      setOpacity(propHotspot.opacity ?? 1);
    }
  }, [propHotspot]);
  return (
    <div className={styles.config_icon_wrapper}>
      <div style={{position:'relative'}}>
        <div className={styles.config_icon_infor}>
          <div className={styles.preview_icon}>
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
              <HotspotPreview
                iconUrl={iconUrl}
                color={color}
                backgroundColor={backgroundColor}
                scale={scale}
                pitchX={pitchX}
                yawY={yawY}
                rollZ={rollZ}
                allowBackgroundColor={allowBackgroundColor}
                opacity={opacity}
              />
            </Canvas>
            <div
              onClick={() => {
                setOpenListIcon((prevState) => !prevState);
              }}
              className={styles.change_icon}
            >
              <FiEdit />
            </div>
          </div>
          <div className={styles.edit_icon_content}>
            <div className={styles.color_icon}>
              <span>Màu:</span>

              <div className={styles.color_icon_content}>
                <input
                  type="color"
                  name=""
                  id="style"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input
                  type="text"
                  name=""
                  id="style"
                  value={color}
                  placeholder="HEX, RGB or HSL"
                />
              </div>
            </div>

            <div className={styles.color_icon}>
              <span>Nền:</span>
              <div className={styles.color_icon_content}>
                <input
                  type="color"
                  name="head"
                  id="bkg"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  disabled={!allowBackgroundColor ? true : false}
                />
                <input
                  type="text"
                  name=""
                  id="bkg"
                  value={backgroundColor}
                  placeholder="HEX, RGB or HSL"
                />
              </div>

              <div
                className={styles.allow_color_background}
                onClick={() => {
                  setAllowBackgroundColor((preState) => !preState);
                }}
              >
                <input id="checkbox" type="checkbox"></input>
              </div>
            </div>
            <div className={styles.color_icon}>
              <span>Độ mờ:</span>
              <div className={styles.opacity_icon_content}>
                <div className={styles.label_opacity}>{opacity}</div>
                <div className={styles.edit_icon_opacity}>
                  <input
                    type="range"
                    name="opacity"
                    id="opacity"
                    min={0}
                    max={1}
                    step={0.1}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                  />
                  <progress max="1" value={opacity}></progress>
                </div>
              </div>
            </div>

            <div className={styles.color_icon}>
              <span>Kích thước:</span>
              <div className={styles.opacity_icon_content}>
                <div className={styles.label_opacity}>{scale}x</div>
                <div className={styles.edit_icon_opacity}>
                  <input
                    type="range"
                    name="scale"
                    id="scale"
                    min={0.5}
                    max={2.5}
                    step={0.25}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                  />
                  <progress
                    max="100"
                    value={((scale - 0.5) * 100) / (2.5 - 0.5)}
                  ></progress>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test */}
        <div className={styles.rotation_cfg}>
          <div className={styles.rotation_cfg_label}>Độ xoay: </div>
          <div className={styles.rotation_cfg_container}>
            <div className={styles.rotation_cfg_optional}>
              <div className={styles.optional_available}>
                <div className={styles.radio_container}>
                  <label className={styles.radio_item}>
                    <input type="radio" name="radio" />
                    <span className={styles.radio_name}>Thủ công</span>
                  </label>
                  <label className={styles.radio_item}>
                    <input
                      type="radio"
                      name="radio"
                      value="floor"
                      checked={isFloor}
                      onChange={() => {
                        setIsFloor(true);
                        setPitchX(-90); // hoặc -90 độ
                        setYawY(0);
                        setRollZ(0);
                      }}
                    />
                    <span className={styles.radio_name}>Dưới nền</span>
                  </label>

                  <label className={styles.radio_item}>
                    <input
                      type="radio"
                      name="radio"
                      id="wall"
                      value="wall"
                      checked={!isFloor}
                      onChange={() => {
                        setIsFloor(false);
                        setPitchX(0);
                        setYawY(0);
                        setRollZ(0);
                      }}
                    />
                    <span className={styles.radio_name}>Trên tường</span>
                  </label>
                </div>
              </div>

              <div className={styles.optional_adjust}>
                {["x", "y", "z"].map((axis) => {
                  let axisClass = ""; //Sử dụng cho css label.
                  let value = 0; //giá trị hiển thị trên input
                  let onChange = (e: React.ChangeEvent<HTMLInputElement>) => {}; //Sử dụng cho method.
                  if (axis === "x") {
                    axisClass = styles.label_x;
                    value = pitchX;
                    onChange = (e) => setPitchX(Number(e.target.value));
                  } else if (axis === "y") {
                    axisClass = styles.label_y;
                    value = yawY;
                    onChange = (e) => setYawY(Number(e.target.value));
                  } else if (axis === "z") {
                    axisClass = styles.label_z;
                    value = rollZ;
                    onChange = (e) => setRollZ(Number(e.target.value));
                  }
                  return (
                    <>
                      <div
                        className={styles.opacity_icon_content}
                        key={axis}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div className={`${styles.label_opacity} ${axisClass}`}>
                          {value}&deg;
                        </div>
                        <div className={styles.edit_icon_opacity}>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            value={value}
                            onChange={onChange}
                          />
                          <progress max="360" value={value + 180}></progress>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
            <div className={styles.rotation_cfg_preview}>
              <div className={styles.grid_xz_plane}></div>
              <div id="x" className={`${styles.axis_x} ${styles.axis}`}>
                <FaArrowRotateLeft className={styles.axis_rotation} />
                <IoIosArrowForward className={styles.axis_arrow} />
                <span>x</span>
              </div>
              <div id="y" className={`${styles.axis_y} ${styles.axis}`}>
                <FaArrowRotateLeft className={styles.axis_rotation} />
                <IoIosArrowForward className={styles.axis_arrow} />
                <span>y</span>
              </div>
              <div id="z" className={`${styles.axis_z} ${styles.axis}`}>
                <FaArrowRotateLeft className={styles.axis_rotation} />
                <IoIosArrowForward className={styles.axis_arrow} />
                <span> z</span>
              </div>
            </div>
          </div>
        </div>
        {/* List icon */}
        {openListIcon ? (
          <ListIcon setIconId={setIconId} setOpen={setOpenListIcon} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ConfigIcon;
