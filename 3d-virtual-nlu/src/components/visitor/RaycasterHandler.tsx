import React, { useCallback, useEffect } from "react";
import * as THREE from "three";
import { useRaycaster } from "../../hooks/useRaycaster";

interface RaycasterHandlerProps {
  sphereRef: React.RefObject<THREE.Mesh | null>;
  onAddHotspot: (position: [number, number, number]) => void;
  hoveredHotspot: THREE.Mesh | null;
  switchTexture: (newPosition: [number, number, number]) => void;
}

const RaycasterHandler: React.FC<RaycasterHandlerProps> = ({
  sphereRef,
  onAddHotspot,
  hoveredHotspot,
  switchTexture,
}) => {
  const { getIntersectionPoint } = useRaycaster();

  /**
   * Xử lý click chuột
   */
  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      if (hoveredHotspot) {
        switchTexture([
          hoveredHotspot.position.x,
          hoveredHotspot.position.y,
          hoveredHotspot.position.z,
        ]);
        return;
      }
      const point = getIntersectionPoint(e, sphereRef.current);
      if (point) {
        console.log(
          `point x : ${point.x}, point y : ${point.y}, point z : ${point.z}`
        );
        onAddHotspot([point.x, point.y, point.z]);
      }
    },
    [
      hoveredHotspot,
      switchTexture,
      getIntersectionPoint,
      sphereRef,
      onAddHotspot,
    ]
  );

  useEffect(() => {
    if (!sphereRef.current) {
      console.warn("sphereRef.current chưa sẵn sàng!");
      return; // Ngăn lỗi xảy ra khi sphereRef chưa được gán
    }
    window.addEventListener("click", handleMouseClick);
    return () => {
      window.removeEventListener("click", handleMouseClick);
    };
  }, [handleMouseClick, sphereRef.current]);

  return null;
};

export default RaycasterHandler;
