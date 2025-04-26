import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type HotspotType = "floor" | "info";
type GroundHotspotProps = {
  position: [number, number, number];
  setHoveredHotspot: (hotspot: THREE.Mesh | null) => void; //test.
  type?: HotspotType;
};

const GroundHotspot: React.FC<GroundHotspotProps> = ({
  position,
  setHoveredHotspot,
  type,
}) => {
  const camera = useThree();
  const hotspotRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/circle.svg"); // Load ảnh
  const [isHovered, setIsHovered] = useState(false);
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);
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

  return (
    <mesh
      ref={hotspotRef}
      position={position}
      // rotation={rotation}
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
    >
      <planeGeometry args={[5, 5]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.6}
        depthTest={false}
      />
    </mesh>
  );
};

export default GroundHotspot;
