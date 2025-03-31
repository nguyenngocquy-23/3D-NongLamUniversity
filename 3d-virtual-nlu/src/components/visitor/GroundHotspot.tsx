import { useFrame, useLoader } from "@react-three/fiber";
import React, { Key, useEffect, useRef, useState } from "react";
import * as THREE from "three";
type GroundHotspotProps = {
  position: [number, number, number];
};

const GroundHotspot: React.FC<GroundHotspotProps> = ({ position }) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/under.png"); // Load ảnh
  const [isHovered, setIsHovered] = useState(false);
  // const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);

  // Lắng nghe sự kiện phím Ctrl [Ctrl + Click sẽ hover vào hotspot]
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Control") setIsCtrlPressed(true);
  //     console.log("🟢 Ctrl được nhấn!");
  //   };

  //   const handleKeyUp = (e: KeyboardEvent) => {
  //     if (e.key === "Control") setIsCtrlPressed(false);
  //     console.log("🔴 Ctrl được thả!");
  //   };
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("keyup", handleKeyUp);
  //   };
  // }, []);

  useEffect(() => {
    if (isHovered) {
      targetOpacity.current = 1;
      targetScale.current = 4;
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

  return (
    <mesh
      ref={hotspotRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={() => {
        setIsHovered(true);
        console.log("🖱 Hover vào hotspot!", position);
      }}
      onPointerOut={() => {
        setIsHovered(false);
        console.log("👋 Rời khỏi hotspot!");
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
