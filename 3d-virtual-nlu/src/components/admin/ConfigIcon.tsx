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
  console.log("CONFIG ICON: currentHotspotType: " + currentHotspotType);

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
      : icons.find((i) => i.id == hotspotTypes[(currentHotspotType ?? 1) - 1].defaultIconId).url;

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
    <div style={{ display: "flex" }}>
      <label>Biểu tượng:</label>
      <div>
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              onClick={() => {
                setOpenListIcon((prevState) => !prevState);
              }}
            >
              Chọn biểu tượng
            </button>
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
                }}
              >
                {allowBackgroundColor ? "Tắt" : "Bật"}
              </button>
            </div>
          </div>
          {!isUpdate ? (
            <div
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: "white",
              }}
            >
              <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                <HotspotPreview
                  iconUrl={iconUrl}
                  color={color}
                  backgroundColor={backgroundColor}
                  scale={scale}
                  pitchX={pitchX}
                  yawY={yawY}
                  rollZ={rollZ}
                  isFloor={isFloor}
                  allowBackgroundColor={allowBackgroundColor}
                  opacity={opacity}
                />
              </Canvas>
            </div>
          ) : (
            ""
          )}
        </div>
        <div style={{ display: "flex" }}>
          <label>Độ mờ:</label>
          <div>
            <div>
              <input
                type="range"
                name="scale"
                id="scale"
                min={0.3}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
              <span>{Math.round(((opacity - 0.3) / 0.7) * 100)}%</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <label>Độ xoay:</label>
          <div>
            <div>
              <input
                type="range"
                name="rotateX"
                id="rotateX"
                min={-180}
                max={180}
                value={pitchX}
                onChange={(e) => setPitchX(Number(e.target.value))}
              />
              <span>{Math.round((pitchX + 180) / 3.6)}%</span>
            </div>
            <div>
              <input
                type="range"
                name="rotateX"
                id="rotateX"
                min={-180}
                max={180}
                value={yawY}
                onChange={(e) => setYawY(Number(e.target.value))}
              />
              <span>{Math.round((yawY + 180) / 3.6)}%</span>
            </div>
            <div>
              <input
                type="range"
                name="rotateX"
                id="rotateX"
                min={-180}
                max={180}
                step={1}
                value={rollZ}
                onChange={(e) => setRollZ(Number(e.target.value))}
              />
              <span>{Math.round((rollZ + 180) / 3.6)}%</span>
            </div>
            <div>
              <input
                type="radio"
                id="floor"
                value="floor"
                checked={isFloor}
                onChange={() => {
                  setIsFloor(true);
                  setPitchX(-90); // hoặc -90 độ
                  setYawY(0);
                  setRollZ(0);
                }} // set lại giá trị của rotate x,y,z
              />
              <label htmlFor="floor">Nền</label>
            </div>
            <div>
              <input
                type="radio"
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
              <label htmlFor="wall">Tường</label>
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
        <div style={{ display: "flex" }}>
          <label>Tiêu đề:</label>
          <div>
            <textarea name="" id=""></textarea>
          </div>
        </div>
      </div>
      {openListIcon ? (
        <ListIcon setIconId={setIconId} setOpen={setOpenListIcon} />
      ) : (
        ""
      )}
    </div>
  );
};

export default ConfigIcon;
