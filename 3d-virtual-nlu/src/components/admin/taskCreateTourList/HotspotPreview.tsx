import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { DoubleSide } from "three";

const HotspotPreview = ({
  iconUrl,
  color,
  backgroundColor,
  scale,
  pitchX,
  yawY,
  rollZ,
  isFloor,
  allowBackgroundColor,
  opacity,
}: {
  iconUrl: string;
  color: string;
  backgroundColor: string;
  scale: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  isFloor: boolean;
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
  }, [pitchX, yawY, rollZ, isFloor]);

  useEffect(() => {
    const loadAndModifySVG = async () => {
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

    loadAndModifySVG();
  }, [iconUrl, color]);

  if (!texture) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={scale}>
      {/* Background Mesh */}
      {allowBackgroundColor ? (
        <mesh position={[0, 0, -0.01]}>
          {/* <planeGeometry args={[5, 5]} /> */}
          <circleGeometry args={[5, 100]} />
          <meshBasicMaterial color={new THREE.Color(backgroundColor)} side={DoubleSide} opacity={opacity} />
        </mesh>
      ) : (
        ""
      )}

      {/* Texture Mesh */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={texture} // Assuming texture is set already
          color={new THREE.Color(color)} // Color of SVG
          transparent
          side={DoubleSide}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

export default HotspotPreview;