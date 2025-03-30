import { useFrame, useLoader } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
type GroundHotspotProps = {
  position: [number, number, number];
  onClick: () => void;
};

const GroundHotspot: React.FC<GroundHotspotProps> = ({ position, onClick }) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/groundHotspot.png"); // Load ảnh

  const normal = new THREE.Vector3(...position).normalize();

  const adjustedPosition = normal.multiplyScalar(99.5);

  const targetOpacity = useRef(0.6);
  useFrame(() => {
    if (hotspotRef.current) {
      const material = hotspotRef.current
        .material as THREE.MeshStandardMaterial;
      material.opacity += (targetOpacity.current - material.opacity) * 0.1;
    }
  });

  return (
    <mesh
      ref={hotspotRef}
      position={adjustedPosition}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={onClick}
      onPointerOver={() => (targetOpacity.current = 1)}
      onPointerOut={() => (targetOpacity.current = 0.6)}
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
