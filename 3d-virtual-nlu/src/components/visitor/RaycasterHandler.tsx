import { useThree } from "@react-three/fiber";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

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
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  /**
   * *Xử lý sự kiện chuột khi zoom
   *
   */
  const zoomLevels = [75, 60, 45, 30]; // test1
  const [zoomIndex, setZoomIndex] = useState(0); //test1
  const targetLookAt = useRef(new THREE.Vector3()); //test1

  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      console.log("🖱 Click event triggered");

      if (hoveredHotspot) {
        console.log("[RaycasterHandler: Đổi texture!");
        const newPosition: [number, number, number] = [
          hoveredHotspot.position.x,
          hoveredHotspot.position.y,
          hoveredHotspot.position.z,
        ]; //Test: Lấy vị trí của điểm hotspot đang hover.
        switchTexture(newPosition);
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

  /**
   * Xử lý sự kiện cuộn chuột để zoom vào hotspot
   */

  const handleMouseWheel = useCallback(
    (e: WheelEvent) => {
      if (!sphereRef.current) return;

      //Lấy vị trí chuột hiện tại
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObject(
        sphereRef.current,
        true
      );

      if (intersects.length > 0) {
        targetLookAt.current.copy(intersects[0].point);
      }

      setZoomIndex((prev) => {
        const newIndex =
          e.deltaY < 0
            ? Math.min(prev + 1, zoomLevels.length - 1)
            : Math.max(prev - 1, 0);

        gsap.to(camera, {
          fov: zoomLevels[newIndex],
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => camera.updateProjectionMatrix(),
        });

        gsap.to(camera.rotation, {
          x: targetLookAt.current.x * 0.002,
          y: targetLookAt.current.y * 0.002,
          z: 0,
          duration: 0.8,
          ease: "power2.out",
        });

        return newIndex;
      });
    },
    [camera, sphereRef]
  );

  useEffect(() => {
    window.addEventListener("wheel", handleMouseWheel);
    return () => {
      window.removeEventListener("wheel", handleMouseWheel);
    };
  }, [handleMouseWheel]);

  return null;
};

export default RaycasterHandler;
