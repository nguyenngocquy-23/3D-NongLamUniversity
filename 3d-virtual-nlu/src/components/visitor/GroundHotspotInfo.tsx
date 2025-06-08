import { useFrame, useThree } from "@react-three/fiber";
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
  setCurrentHotspotId?: (val: string | null) => void;
  hotspotInfo: HotspotInformation;
};

const GroundHotspotInfo = ({
  setCurrentHotspotId,
  hotspotInfo,
}: GroundHotspotProps) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const icons = useSelector((state: RootState) => state.data.icons);

  const iconObj = icons.find((i) => i.id == hotspotInfo.iconId);
  const iconUrl = iconObj ? iconObj.url : "";

  const currentStep = useSelector((state: RootState) => state.step.currentStep);

  const targetOpacity = useRef(hotspotInfo.opacity);
  const targetScale = useRef(hotspotInfo.scale);

  // Kiểm tra trạng thái chuột với model.
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setClicked] = useState(false);
  const { gl } = useThree();
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);

  useEffect(() => {
    if (isHovered || isClicked) {
      targetOpacity.current = hotspotInfo.opacity + 0.5;
      targetScale.current = hotspotInfo.scale + 0.5;
      console.log("opacity 1:..", targetOpacity.current);
    } else {
      targetOpacity.current = hotspotInfo.opacity;
      targetScale.current = hotspotInfo.scale;
      console.log("opacity 2:..", targetOpacity.current);
    }
  }, [isHovered, hotspotInfo]);

  useFrame(() => {
    if (hotspotRef.current) {
      const material = hotspotRef.current.material as THREE.MeshBasicMaterial;
      material.opacity += (targetOpacity.current - material.opacity) * 0.1;
      hotspotRef.current.scale.lerp(
        new THREE.Vector3(targetScale.current, targetScale.current, 1),
        0.1
      );
    }
  });

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

  const htmlGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (htmlGroupRef.current) {
      const obj = htmlGroupRef.current;
      obj.lookAt(camera.position);
      obj.rotateY(Math.PI);
    }
  });

  return (
    <>
      {isClicked ? (
        <group
          ref={htmlGroupRef}
          position={[
            hotspotInfo.positionX,
            hotspotInfo.positionY + 15,
            hotspotInfo.positionZ,
          ]}
        >
          <Html distanceFactor={40} transform>
            <div className={styles.container}>
              <div className={styles.centerPane}>
                {hotspotInfo.title.trim() == "" &&
                hotspotInfo.content.trim() == "" ? (
                  <div className={styles.description}>Trống</div>
                ) : (
                  <>
                    <div className={styles.title}>{hotspotInfo.title}</div>
                    <div className={styles.description}>
                      {hotspotInfo.content}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Html>
        </group>
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
        rotation={[
          THREE.MathUtils.degToRad(hotspotInfo.pitchX),
          THREE.MathUtils.degToRad(hotspotInfo.yawY),
          THREE.MathUtils.degToRad(hotspotInfo.rollZ),
        ]}
        onPointerOver={() => {
          setIsHovered(true);
          gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
        }}
        onPointerOut={() => {
          setIsHovered(false);
          gl.domElement.style.cursor = "default";
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
          opacity={hotspotInfo.opacity}
          depthTest={false}
          color={new THREE.Color(hotspotInfo.color)}
          side={DoubleSide}
        />
      </mesh>
      {isOpenHotspotOption && currentStep != 3 && currentStep != 1 ? (
        <OptionHotspot
          hotspotId={hotspotInfo.id}
          setCurrentHotspotId={setCurrentHotspotId ?? (() => {})}
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
