import { Html } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three";
import { AppDispatch, RootState } from "../../redux/Store";
import { HotspotNavigation } from "../../redux/slices/HotspotSlice";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";

type HotspotType = "floor" | "info";

type GroundHotspotProps = {
  setHoveredHotspot: (hotspot: THREE.Mesh | null) => void; //test.
  type?: HotspotType;
  onNavigate: (
    targetNodeId: string,
    cameraTargetPosition: [number, number, number]
  ) => void;
  hotspotNavigation: HotspotNavigation;
  setCurrentHotspotId: (val: string | null) => void;
};

const GroundHotspot: React.FC<GroundHotspotProps> = ({
  setHoveredHotspot,
  type,
  // idHotspot,
  onNavigate,
  hotspotNavigation,
  setCurrentHotspotId,
}) => {
  const camera = useThree();
  const hotspotRef = useRef<THREE.Mesh>(null);

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
    if (type == "info" && hotspotRef.current) {
      hotspotRef.current.lookAt(camera.camera.position);
    }
  });

  const panoramaList = useSelector(
    (state: RootState) => state.panoramas.panoramaList
  );

  const hotspot = useSelector((state: RootState) =>
    state.hotspots.hotspotList.find(
      (h): h is HotspotNavigation =>
        h.id === hotspotNavigation.id && h.type === 1
    )
  );

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
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => {
          setIsHovered(true);
          console.log("🖱 Hover vào hotspot!", [
            hotspotNavigation.positionX,
            hotspotNavigation.positionY,
            hotspotNavigation.positionZ,
          ]);
          setHoveredHotspot(hotspotRef.current); //test
        }}
        onPointerOut={() => {
          setIsHovered(false);
          console.log("Rời khỏi hotspot!");
          setHoveredHotspot(null); //test
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (hotspot && hotspot.targetNodeId) {
            onNavigate(hotspot.targetNodeId, [
              hotspot.positionX,
              hotspot.positionY,
              hotspot.positionZ,
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

      {isOpenHotspotOption && (
        <OptionHotspot
          hotspotId={hotspotNavigation.id}
          setCurrentHotspotId={setCurrentHotspotId}
          onClose={() => {
            setIsOpenHotspotOption(false);
          }}
          position={[
            hotspotNavigation.positionX,
            hotspotNavigation.positionY,
            hotspotNavigation.positionZ,
          ]}
        />
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
