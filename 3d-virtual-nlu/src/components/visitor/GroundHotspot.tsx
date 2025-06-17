import { Html } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three";
import { RootState } from "../../redux/Store";
import { HotspotNavigation } from "../../redux/slices/HotspotSlice";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";

type GroundHotspotProps = {
  onNavigate: (
    targetNodeId: string,
    cameraTargetPosition: [number, number, number]
  ) => void;
  hotspotNavigation: HotspotNavigation;
  setCurrentHotspotId?: (val: string | null) => void;
};

/**
 *
 * @param param0
 * @returns
 */
const GroundHotspot: React.FC<GroundHotspotProps> = ({
  onNavigate,
  hotspotNavigation,
  setCurrentHotspotId,
}) => {
  const camera = useThree();
  const hotspotRef = useRef<THREE.Mesh>(null);
  const currentStep = useSelector((state: RootState) => state.step.currentStep);

  const { icons, hotspotTypes } = useSelector((state: RootState) => state.data);
  const iconUrl = icons.find((i) => i.id == hotspotNavigation.iconId).url;

  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);

  /**
   * Đang thử nghiệm
   */
  // const [isClicked, setIsClicked] = useState(false);
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);

  useEffect(() => {
    if (isHovered) {
      targetOpacity.current = 1;
      targetScale.current = 3;
    } else {
      targetOpacity.current = 0.6;
      targetScale.current = 2;
    }
  }, [isHovered]);

  useFrame(() => {
    if (hotspotRef.current) {
      const material = hotspotRef.current
        .material as THREE.MeshStandardMaterial;
      material.opacity += (targetOpacity.current - material.opacity) * 0.1;
      hotspotRef.current.scale.lerp(
        new THREE.Vector3(targetScale.current, targetScale.current, 1),
        0.1
      );
    }
  });

  /**
   * Tập trung cho việc xử lý chỉnh sửa icon cho hotspsot.
   */
  useEffect(() => {
    const loadAndModifySVG = async () => {
      try {
        const res = await fetch(iconUrl);
        let svgText = await res.text();

        // Thay fill nếu không có hoặc cập nhật fill hiện tại
        const hasFill =
          svgText.includes('fill="') || svgText.includes("fill='");

        if (!hasFill) {
          svgText = svgText.replace(
            "<svg",
            `<svg fill="${hotspotNavigation.color}"`
          );
        } else {
          svgText = svgText.replace(
            /fill="[^"]*"|fill='[^']*'/g,
            `fill="${hotspotNavigation.color}"`
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
  }, [iconUrl, hotspotNavigation]);

  return (
    <>
      <mesh
        ref={hotspotRef}
        position={[
          hotspotNavigation.positionX,
          hotspotNavigation.positionY,
          hotspotNavigation.positionZ,
        ]}
        rotation={[
          THREE.MathUtils.degToRad(hotspotNavigation.pitchX),
          THREE.MathUtils.degToRad(hotspotNavigation.yawY),
          THREE.MathUtils.degToRad(hotspotNavigation.rollZ),
        ]}
        onPointerOver={() => {
          setIsHovered(true);
        }}
        onPointerOut={() => {
          setIsHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (hotspotNavigation && hotspotNavigation.targetNodeId) {
            onNavigate(hotspotNavigation.targetNodeId, [
              hotspotNavigation.positionX,
              hotspotNavigation.positionY,
              hotspotNavigation.positionZ,
            ]);
          }
        }}
        onContextMenu={() => {
          // Ngăn menu mặc định
          if (isHovered) {
            setIsOpenHotspotOption((prev) => !prev);
          }
        }}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.6}
          depthTest={false}
          color={new THREE.Color(hotspotNavigation.color)}
          side={THREE.DoubleSide}
        />
      </mesh>

      {isOpenHotspotOption && currentStep != 1 ? (
        <OptionHotspot
          hotspotId={hotspotNavigation.id}
          setCurrentHotspotId={setCurrentHotspotId ?? (() => {})}
          onClose={() => {
            setIsOpenHotspotOption(false);
          }}
          position={[
            hotspotNavigation.positionX,
            hotspotNavigation.positionY,
            hotspotNavigation.positionZ,
          ]}
        />
      ) : (
        ""
      )}

      {/* {isClicked && (
        <Html position={position} center distanceFactor={50}>
          <select
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                console.log("🔽 Đã chọn panorama:", hotspotNavigation.id);
                dispatch(
                  updateNavigationHotspotTarget({
                    id: hotspotNavigation.id,
                    targetNodeId: selectedId,
                  })
                );
                setIsClicked(false);
              }
            }}
          >
            <option value="">Chọn panorama</option>
            {panoramaList.map((pano) => (
              <option key={pano.id} value={pano.id}>
                {pano.config.name || "null"}
              </option>
            ))}
          </select>
        </Html>
      )} */}
    </>
  );
};

export default GroundHotspot;
