import { useEffect, useMemo, useRef, useState } from "react";
import ListIcon from "./ListIcon";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";

const HotspotPreview = ({
  iconUrl,
  color,
  backgroundColor,
  pitchX,
  yawY,
  rollZ,
  isFloor,
  allowBackground,
}: {
  iconUrl: string;
  color: string;
  backgroundColor: string;
  pitchX: number;
  yawY: number;
  rollZ: number;
  isFloor: boolean;
  allowBackground: boolean;
}) => {
  const groupRef = useRef<any>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Góc xoay mặc định cho mỗi loại
      const baseRotation = isFloor
        ? [Math.PI / 2, 0, 0] // Nền: mặt nằm ngang, xoay xuống dưới
        : [0, 0, 0]; // Tường: mặt đứng đối diện camera

      // Cộng thêm các góc điều chỉnh từ người dùng
      groupRef.current.rotation.set(
        baseRotation[0] + pitchX * (Math.PI / 180),
        baseRotation[1] + yawY * (Math.PI / 180),
        baseRotation[2] + rollZ * (Math.PI / 180)
      );
    }
  }, [pitchX, yawY, rollZ, isFloor]);
  useEffect(() => {
    const loadAndModifySVG = async () => {
      try {
        const res = await fetch(
          iconUrl
        );
        let svgText = await res.text();

        // Thay fill nếu không có hoặc cập nhật fill hiện tại
        const hasFill =
          svgText.includes('fill="') || svgText.includes("fill='");

        if (!hasFill) {
          svgText = svgText.replace("<svg", `<svg fill="${color}"`);
        } else {
          svgText = svgText.replace(
            /fill="[^"]*"|fill='[^']*'/g,
            `fill="${color}"`
          );
        }

        // Tạo Blob từ SVG text
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          const tex = new THREE.Texture(img);
          tex.needsUpdate = true;
          setTexture(tex);
          URL.revokeObjectURL(url); // Giải phóng bộ nhớ
        };
        img.src = url;
      } catch (err) {
        console.error("Error loading or processing SVG:", err);
      }
    };

    loadAndModifySVG();
  }, [iconUrl, color]);

  if (!texture) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Background Mesh */}
      {allowBackground ? (
        <mesh position={[0, 0, -0.01]}>
          {/* <planeGeometry args={[5, 5]} /> */}
          <circleGeometry args={[5, 100]} />
          <meshBasicMaterial color={new THREE.Color(backgroundColor)} />
        </mesh>
      ) : (
        ""
      )}

      {/* Texture Mesh */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={texture} // Assuming texture is set already
          color={new THREE.Color(color)} // Color of SVG
          transparent
        />
      </mesh>
    </group>
  );
};

const ConfigIcon = ({
  currenHotspotType,
}: {
  currenHotspotType: number | null;
}) => {
  const [openListIcon, setOpenListIcon] = useState(false);

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  // Panorama hiện tại.
  const currentPanorama = panoramaList.find(
    (pano) => pano.id === currentSelectId
  );

  const defaultIconIds = useSelector(
    (state: RootState) => state.data.hotspotTypes
  );

  const icons = useSelector(
    (state: RootState) => state.data.icons
  );

  const [iconId, setIconId] = useState(0);
  const iconUrl = iconId ? icons.find((i)=> i.id == iconId).url : icons[currenHotspotType??1].url ;

  const [scale, setScale] = useState(1);
  const [isFloor, setIsFloor] = useState(false);
  const [pitchX, setPitchX] = useState(0);
  const [yawY, setYawY] = useState(0);
  const [rollZ, setRollZ] = useState(0);
  const [color, setColor] = useState("#333333");
  const [backgroundColor, setBackgroundColor] = useState("#333333");
  const [allowBackground, setAllowBackground] = useState(true);

  const handleInitialHotspotProps = (): {
    nodeId: string;
    iconId: number;
    positionX: number;
    positionY: number;
    positionZ: number;
    scale: number;
    pitchX: number;
    yawY: number;
    rollZ: number;
  } | null => {
    return {
      nodeId: currentPanorama?.id ?? "",
      iconId: iconId != 0 ? iconId : defaultIconIds[currenHotspotType ?? 1],
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      scale: scale,
      pitchX: pitchX,
      yawY: yawY,
      rollZ: rollZ,
    };
  };

  const [basicProps, setBasicProps] = useState<ReturnType<
    typeof handleInitialHotspotProps
  > | null>(null);

  useEffect(() => {
    const props = handleInitialHotspotProps();
    setBasicProps(props);
  }, [currenHotspotType, currentPanorama, scale, pitchX, yawY, rollZ]);

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
                disabled={!allowBackground ? true : false}
              />
              <button
                onClick={() => {
                  setAllowBackground((preState) => !preState);
                }}
              >
                {allowBackground ? "Tắt" : "Bật"}
              </button>
            </div>
          </div>
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
                pitchX={pitchX}
                yawY={yawY}
                rollZ={rollZ}
                isFloor={isFloor}
                allowBackground={allowBackground}
              />
            </Canvas>
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
                value={rollZ}
                onChange={(e) => setRollZ(Number(e.target.value))}
              />
              <span>{Math.round((rollZ + 180) / 3.6)}%</span>
            </div>
            <div>
              <input
                type="checkbox"
                id="floor"
                value="floor"
                checked={isFloor}
                onChange={() => setIsFloor(true)} // set lại giá trị của rotate x,y,z 
              />
              <label htmlFor="floor">Nền</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="wall"
                value="wall"
                checked={!isFloor}
                onChange={() => setIsFloor(false)}
              />
              <label htmlFor="wall">Tường</label>
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
      {openListIcon ? <ListIcon setIconId={setIconId} setOpen={setOpenListIcon} /> : ""}
    </div>
  );
};

export default ConfigIcon;
