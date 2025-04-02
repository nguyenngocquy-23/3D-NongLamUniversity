/**
 * useRaycaster là custom hook sử dụng với mục đích:
 * - Lắng nghe các sự kiện chuột và xác định được điểm va chạm. (2d màn hình sang 3d không gian)
 */

import { useThree } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import * as THREE from "three";

export const useRaycaster = () => {
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Hàm trả về điểm va chạm trên bề mặt cầu.

  const getIntersectionPoint = useCallback(
    (e: MouseEvent | WheelEvent, object: THREE.Object3D | null) => {
      if (!object) return null;

      mouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObject(object, true);

      return intersects.length > 0 ? intersects[0].point : null;
    },
    [camera]
  );
  return { getIntersectionPoint };
};
