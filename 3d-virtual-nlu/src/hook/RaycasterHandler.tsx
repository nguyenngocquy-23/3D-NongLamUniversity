import { useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface RaycasterHandlerProps {
  sphereRef: React.RefObject<THREE.Mesh | null>;
}

const RaycasterHandler: React.FC<RaycasterHandlerProps> = ({ sphereRef }) => {
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      console.log("🖱 Click event triggered");
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
      } else {
        console.log("Không có điểm nào trên bề mặt.");
      }
    };
    window.addEventListener("click", handleMouseClick);
    return () => window.removeEventListener("click", handleMouseClick);
  }, [camera, sphereRef]);
  return null;
};

// const [hotspots, setHotspots] = useState<
//   { id: number; position: [number, number, number] }[]
// >([]);

//   const addHotspot = useCallback(
//     (e: any) => {
//       const raycaster = new THREE.Raycaster();
//       const mouse = new THREE.Vector2();

//       mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
//       mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

//       raycaster.setFromCamera(mouse, camera);
//       const sphere = scene.getObjectByName(sphereName);
//       if (!sphere) return;

//       const intersects = raycaster.intersectObject(sphere);
//       if (intersects.length > 0) {
//         const point = intersects[0].point;

//         // Đẩy điểm ra ngoài bề mặt cầu một chút để tránh bị chìm
//         const normal = new THREE.Vector3(point.x, point.y, point.z).normalize();
//         const adjustedPosition: [number, number, number] = normal
//           .multiplyScalar(radius - 0.5) // Dịch ra ngoài bề mặt
//           .toArray() as [number, number, number];

//         setHotspots((prev) => [
//           ...prev,
//           { id: prev.length + 1, position: adjustedPosition },
//         ]);
//       }
//     },
//     [camera, scene, radius]
//   );

//   return { hotspots, addHotspot };
// };

export default RaycasterHandler;
