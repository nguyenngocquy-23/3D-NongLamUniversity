import { useTexture } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
type GroundHotspotProps = {
  position: [number, number, number];
};

const PointMedia: React.FC<GroundHotspotProps> = ({ position }) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  // useTexture.preload('/under.png');
  // const texture = useTexture("/under.png"); // Load ảnh
  const texture = new THREE.TextureLoader().load('under.png'); // Load ảnh
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Suspense fallback={null}>
      <mesh
        ref={hotspotRef}
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.6}
          depthTest={false}
        />
      </mesh>
    </Suspense>
  );
};

export default PointMedia;
