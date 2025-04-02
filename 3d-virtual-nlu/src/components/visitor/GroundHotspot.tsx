import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
type GroundHotspotProps = {
  position: [number, number, number];
  setHoveredHotspot: (hotspot: THREE.Mesh | null) => void; //test.
};

const GroundHotspot: React.FC<GroundHotspotProps> = ({
  position,
  setHoveredHotspot,
}) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/under.png"); // Load ảnh
  const [isHovered, setIsHovered] = useState(false);
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);
  const { camera } = useThree(); // Get camera from context

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
      // Make the hotspot look at the camera
      // Giữ cho hotspot luôn hướng về camera
      // const lookAtPos = new THREE.Vector3(
      //   camera.position.x,
      //   hotspotRef.current.position.y,
      //   camera.position.z
      // );
      // hotspotRef.current.lookAt(lookAtPos);
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
