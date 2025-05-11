import { Html } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three";
import { AppDispatch, RootState } from "../../redux/Store";
import { updateNavigationHotspotTarget } from "../../redux/slices/HotspotSlice";

type HotspotType = "floor" | "info";
type GroundHotspotProps = {
  position: [number, number, number];
  setHoveredHotspot: (hotspot: THREE.Mesh | null) => void; //test.
  type?: HotspotType;
  nodeId: string;
  idHotspot: string;
};

const GroundHotspot: React.FC<GroundHotspotProps> = ({
  position,
  setHoveredHotspot,
  type,
  nodeId,
  idHotspot,
}) => {
  const camera = useThree();
  const hotspotRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/circle.svg"); // Load ảnh
  const [isHovered, setIsHovered] = useState(false);
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);

  /**
   * Đang thử nghiệm
   */
  const [isClicked, setIsClicked] = useState(false);

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
  const dispatch = useDispatch<AppDispatch>();

  return (
    <>
      <mesh
        ref={hotspotRef}
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => {
          setIsHovered(true);
          console.log("🖱 Hover vào hotspot!", position);
          setHoveredHotspot(hotspotRef.current); //test
        }}
        onPointerOut={() => {
          setIsHovered(false);
          console.log("Rời khỏi hotspot!");
          setHoveredHotspot(null); //test
        }}
        onContextMenu={() => {
          // Ngăn menu mặc định
          if (isHovered) {
            setIsClicked((prev) => !prev);
            console.log(
              "🖱 Click chuột phải vào hotspot khi đang hover!",
              nodeId
            );
          }
        }}
      >
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.6}
          depthTest={false}
        />
      </mesh>

      {isClicked && (
        <Html position={position} center distanceFactor={50}>
          <select
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                console.log("🔽 Đã chọn panorama:", idHotspot);
                dispatch(
                  updateNavigationHotspotTarget({
                    id: idHotspot,
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
      )}
    </>
  );
};

export default GroundHotspot;
