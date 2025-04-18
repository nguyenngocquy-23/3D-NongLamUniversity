import React, { useCallback, useEffect } from "react";
import * as THREE from "three";
import { useRaycaster } from "../../hooks/useRaycaster";

interface RaycasterHandlerProps {
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  onAddHotspot: (
    position: [number, number, number],
    type: "floor" | "info"
  ) => void;
  hoveredHotspot: THREE.Mesh | null;
  switchTexture: (newPosition: [number, number, number]) => void;
}

const RaycasterHandler: React.FC<RaycasterHandlerProps> = ({
  radius,
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
        const { x, y, z } = point;
        const lowerThreshold = -radius * 0.3;
        const middleThreshold = -radius * 0.1;
        const upperThreshold = radius * 0.3;
        let type: "floor" | "info" = "floor";

        if (y <= lowerThreshold) {
          type = "floor";
        } else if (middleThreshold < y && y < upperThreshold) {
          type = "info";
        }

        onAddHotspot([x, y, z], type);
      }
    },
    [
      hoveredHotspot,
      switchTexture,
      getIntersectionPoint,
      sphereRef,
      onAddHotspot,
      radius,
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
