import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { DoubleSide } from "three";

const HotspotPreview = ({
  iconUrl,
  typeIcon,
  color,
  backgroundColor,
  scale,
  pitchX,
  yawY,
  rollZ,
  allowBackgroundColor,
  opacity,
}: {
  iconUrl: string;
  typeIcon: number;
  color: string;
  backgroundColor: string;
  scale: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  allowBackgroundColor: boolean;
  opacity: number;
}) => {
  const groupRef = useRef<any>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Cộng thêm các góc điều chỉnh từ người dùng
      groupRef.current.rotation.set(
        pitchX * (Math.PI / 180),
        yawY * (Math.PI / 180),
        rollZ * (Math.PI / 180)
      );
    }
  }, [pitchX, yawY, rollZ]);
  // useFrame(() => {
  //   if (type === 2 && groupRef.current) {
  //     groupRef.current.rotation.y += 0.01;
  //   }
  // });

  //CASE 1: 2D ICON - SVG
  useEffect(() => {
    const loadAndModifySVG = async () => {
      if (typeIcon !== 1) return;
      try {
        const res = await fetch(iconUrl);
        let svgText = await res.text();

        // Thay fill nếu không có hoặc cập nhật fill hiện tại
        const hasFill =
          svgText.includes('fill="') || svgText.includes("fill='");

        if (!hasFill) {
          svgText = svgText.replace("<svg", `<svg fill="${color}"`);
        } else {
          svgText = svgText.replace(
            /fill="[^"]*"|fill='[^']*'/g,
            `fill="${color}"`
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
    console.log("[HotspotPreview: " + iconUrl);
    loadAndModifySVG();
  }, [iconUrl, color]);

  //CASE 2: 3D ICON -GLB
  // const iconGlb = typeIcon === 2 ? useGLTF(iconUrl) : null;

  // if (typeIcon === 1 && !texture) return null;
  if (!texture) return null;
  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={scale}>
      {allowBackgroundColor ? (
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[5, 100]} />
          <meshBasicMaterial
            color={new THREE.Color(backgroundColor)}
            side={DoubleSide}
            opacity={opacity}
          />
        </mesh>
      ) : (
        ""
      )}

      {/* {typeIcon === 1 && ( */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={texture}
          color={new THREE.Color(color)}
          transparent
          side={DoubleSide}
          opacity={opacity}
        />
      </mesh>
      {/* )} */}

      {/* {typeIcon === 2 && iconGlb && (
        <>
          <primitive object={iconGlb.scene} scale={5} />
          <ambientLight color={"#fff"} intensity={5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
        </>
      )} */}
    </group>
  );
};

export default HotspotPreview;
