import React, { useEffect, useMemo, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CurvedScreenProps = {
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  textureCurrent: string;
  lightIntensity?: number | string;
};

const CurvedScreen: React.FC<CurvedScreenProps> = ({
  radius,
  sphereRef,
  textureCurrent,
  lightIntensity,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (sphereRef && meshRef.current) {
      sphereRef.current = meshRef.current;
    }
  }, [sphereRef]);

  const texture = new THREE.TextureLoader().load(textureCurrent);
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = "srgb";
  // texture.needsUpdate = true;

  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      window.innerWidth * 0.5, // top radius
      window.innerWidth * 0.5, // bottom radius
      window.innerHeight * 0.8, // height
      64, // radial segments (smoothness)
      1, // height segments
      true, // openEnded: no top/bottom
      Math.PI / 2, // thetaStart (start from left)
      Math.PI // thetaLength (180° = nửa hình trụ)
    );
  }, [radius]);

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[0, 0, 0]}
        position={[0, 0, 0]}
        castShadow // mesh phát bóng
      >
        <meshBasicMaterial
          map={texture}
          color={"#fff"}
          transparent
          side={THREE.BackSide}
          opacity={1}
        />
      </mesh>
    </>
  );
};

export default CurvedScreen;
