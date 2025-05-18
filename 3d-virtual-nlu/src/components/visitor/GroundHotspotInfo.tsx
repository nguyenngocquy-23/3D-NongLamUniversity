import { useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "../../styles/cardModel.module.css";
import * as THREE from "three";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { HotspotInformation } from "../../redux/slices/HotspotSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { DoubleSide } from "three";
import { Html } from "@react-three/drei";
type GroundHotspotProps = {
  setCurrentHotspotId: (val: string | null) => void;
  setHoveredHotspot: (hotspot: THREE.Mesh | null) => void;
  hotspotInfo: HotspotInformation;
};

const GroundHotspotInfo = ({
  setCurrentHotspotId,
  setHoveredHotspot,
  hotspotInfo,
}: GroundHotspotProps) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const icons = useSelector((state: RootState) => state.data.icons);
  const iconUrl = icons.find((i) => i.id == hotspotInfo.iconId).url;
  const modelRef = useRef<THREE.Group>(null); //gọi lại group trong return.
  /**
   * Đang set tạm
   */
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);

  // Kiểm tra trạng thái chuột với model.
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setClicked] = useState(false);
  const { gl } = useThree();
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);

  useEffect(() => {
    if (isHovered || isClicked) {
      targetOpacity.current = 1;
      targetScale.current = 3;
    } else {
      targetOpacity.current = 0.6;
      targetScale.current = 2;
    }
  }, [isHovered]);

  useEffect(() => {
    const loadAndModifySVG = async () => {
      try {
        const res = await fetch(iconUrl);
        let svgText = await res.text();

        // Thay fill nếu không có hoặc cập nhật fill hiện tại
        const hasFill =
          svgText.includes('fill="') || svgText.includes("fill='");

        if (!hasFill) {
          svgText = svgText.replace("<svg", `<svg fill="${hotspotInfo.color}"`);
        } else {
          svgText = svgText.replace(
            /fill="[^"]*"|fill='[^']*'/g,
            `fill="${hotspotInfo.color}"`
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
  }, [iconUrl, hotspotInfo]); // thêm color khi update

  return (
    <>
      {isClicked ? (
        <Html
          position={[
            hotspotInfo.positionX,
            hotspotInfo.positionY + 16,
            hotspotInfo.positionZ,
          ]}
          distanceFactor={40}
          transform
        >
          <div className={styles.container}>
            <div className={styles.centerPane}>
              <div className={styles.title}>{hotspotInfo.title}</div>
              <div className={styles.description}>{hotspotInfo.content}</div>
            </div>
          </div>
        </Html>
      ) : (
        ""
      )}
      <mesh
        ref={hotspotRef}
        position={[
          hotspotInfo.positionX,
          hotspotInfo.positionY,
          hotspotInfo.positionZ,
        ]}
        rotation={[hotspotInfo.pitchX, hotspotInfo.yawY, hotspotInfo.rollZ]}
        onPointerOver={() => {
          setIsHovered(true);
          setHoveredHotspot(hotspotRef.current); //test
          gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
        }}
        onPointerOut={() => {
          setIsHovered(false);
          setHoveredHotspot(null); //test
          gl.domElement.style.cursor = "default"; // 👈 đổi cursor
        }}
        onClick={() => {
          setClicked((preState) => !preState);
        }}
        onContextMenu={(e) => {
          e.nativeEvent.preventDefault(); // 👈 bắt buộc
          setIsOpenHotspotOption(true);
        }}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.6}
          depthTest={false}
          color={new THREE.Color(hotspotInfo.color)}
          side={DoubleSide}
        />
      </mesh>
      {isOpenHotspotOption ? (
        <OptionHotspot
          hotspotId={hotspotInfo.id}
          setCurrentHotspotId={setCurrentHotspotId}
          onClose={() => {
            setIsOpenHotspotOption(false);
          }}
          position={[
            hotspotInfo.positionX,
            hotspotInfo.positionY,
            hotspotInfo.positionZ,
          ]}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default GroundHotspotInfo;
