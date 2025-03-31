import { useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface RaycasterHandlerProps {
  sphereRef: React.RefObject<THREE.Mesh | null>;
  onAddHotspot: (position: [number, number, number]) => void;
  hoveredHotspot: THREE.Mesh | null; //test
  switchTexture: () => void; //test
}

const RaycasterHandler: React.FC<RaycasterHandlerProps> = ({
  sphereRef,
  onAddHotspot,
  hoveredHotspot, //test
  switchTexture, //test
}) => {
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null); //test

  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      console.log("🖱 Click event triggered");

      if (hoveredHotspot) {
        console.log("[RaycasterHandler: Đổi texture!");
        switchTexture();
        return;
      }

      if (!sphereRef.current) {
        console.warn("sphereRef hiện tại là null!");
        return;
      }

      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      const intersects = raycaster.current.intersectObject(
        sphereRef.current,
        true
      );

      if (intersects.length > 0) {
        const point = intersects[0].point;
        console.log("Toạ độ trên bề mặt: ", point);
        onAddHotspot([point.x, point.y, point.z]); // Gọi hàm thêm hotspot với toạ độ đã tính toán
      }
    };
    window.addEventListener("click", handleMouseClick);
    return () => window.removeEventListener("click", handleMouseClick);
  }, [camera, sphereRef, onAddHotspot, hoveredHotspot]);
  return null;
};

export default RaycasterHandler;
