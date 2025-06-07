import React, { useEffect, useMemo, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CurvedScreenProps = {
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  textureCurrent: string;
  lightIntensity?: number | string;
};

const ShadowScreen: React.FC<CurvedScreenProps> = ({
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

  const texture = new THREE.TextureLoader().load(textureCurrent, (tex) => {
    const img = tex.image;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(0,0,0,0)"); // Phần trên cùng, 0% - 20% rõ
    gradient.addColorStop(0.6, "rgba(0,0,0,0)"); // Đảm bảo 20% đầu vẫn rõ
    gradient.addColorStop(1, "rgba(0,0,0,0.5)");

    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    tex.image = canvas;
    tex.needsUpdate = true;
  });

  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = "srgb";
  texture.needsUpdate = true;
  texture.flipY = false;

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
        position={[0, -window.innerHeight * 0.8, 0]}
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

export default ShadowScreen;
