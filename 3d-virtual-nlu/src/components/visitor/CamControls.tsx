// import { OrbitControls } from "@react-three/drei";
// import { useThree, useFrame } from "@react-three/fiber";
// import { useCallback, useEffect, useRef, useState } from "react";
// import * as THREE from "three";
// import { useRaycaster } from "../../hooks/useRaycaster";
// import gsap from "gsap";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../../redux/Store";
// import { updateCurrentAngleMaster } from "../../redux/slices/PanoramaSlice";
// /**
//  * Nguyên lý hoạt động của OrbitControls:
//  * 1. Luôn setup camera hướng về target tâm cầu.
//  * 2. Xoay: tức là xoay camera đi quanh cầu, nếu coi tâm là mặt trời thì camera là trái đất.
//  * 3. Zoom: nôm na là đưa trái đất về gần mặt trời hơn.
//  * => Vậy thì ta cần lật ngược camera lại 180 độ để camera nhìn về hướng ngược lại.
//  *
//  */

// type CamControlsProps = {
//   targetPosition?: [number, number, number] | null; //test
//   sphereRef: React.RefObject<THREE.Mesh | null>;
//   cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
//   controlsRef: React.RefObject<any>;
//   autoRotate: boolean;
//   autoRotateSpeed: number | null;

//   //Test cho callback
//   onAngleChange?: (angle: number) => void;
//   onAngleChangeForMinimap?: (angle: number) => void;
// };

// const zoomLevels = [75, 60, 45, 30];

// const CamControls: React.FC<CamControlsProps> = ({
//   targetPosition,
//   sphereRef,
//   cameraRef,
//   controlsRef,
//   autoRotate,
//   autoRotateSpeed,
//   onAngleChange,
//   onAngleChangeForMinimap,
// }) => {
//   const { gl } = useThree();
//   const canvas = gl.domElement;
//   // const controlsRef = useRef<any>(null); //OrbitControls
//   const { camera } = useThree();
//   const { getIntersectionPoint } = useRaycaster();
//   const [zoomIndex, setZoomIndex] = useState(0);
//   const targetLookAt = useRef(new THREE.Vector3());
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     if (cameraRef && camera instanceof THREE.PerspectiveCamera) {
//       cameraRef.current = camera;
//     }
//   }, [cameraRef, camera]);

//   /**
//    * Xử lý sự kiện chuột : Zoom bằng cách thay đổi FOV để tránh méo ảnh.
//    */
//   const handleMouseWheel = useCallback(
//     (e: WheelEvent) => {
//       const point = getIntersectionPoint(e, sphereRef.current);
//       if (point) {
//         targetLookAt.current.copy(point);
//       }

//       setZoomIndex((prev) => {
//         const newIndex =
//           e.deltaY < 0
//             ? Math.min(prev + 1, zoomLevels.length - 1)
//             : Math.max(prev - 1, 0);

//         gsap.to(camera, {
//           fov: zoomLevels[newIndex],
//           duration: 0.8,
//           ease: "power2.out",
//           onUpdate: () => camera.updateProjectionMatrix(),
//         });

//         gsap.to(camera.rotation, {
//           x: targetLookAt.current.x * 0.002,
//           y: targetLookAt.current.y * 0.002,
//           z: 0,
//           duration: 0.8,
//           ease: "power2.out",
//         });
//         return newIndex;
//       });
//     },
//     [getIntersectionPoint, sphereRef]
//   );

//   useEffect(() => {
//     canvas.addEventListener("wheel", handleMouseWheel);
//     return () => {
//       canvas.removeEventListener("wheel", handleMouseWheel);
//     };
//   }, [handleMouseWheel]);

//   /**
//    *  Tính năng: Di chuyển giữa các node hotspot.
//    *  + Điểm hotspot khi click.
//    *  + Để tạo cảm giác move tới, ta thực hiện việc cho camera đi từ tâm đến hotspot.
//    *   Với hotspot di chuyển, ta sẽ cho camera đi đến hotspot và camera luôn luôn nằm trên mặt phẳng XZ tạo cảm giác giống mắt người.
//    *
//    */

//   // B1. Lưu vị trí cũ và target mới.
//   const currentCameraPosition = useRef(new THREE.Vector3());
//   const currentTargetPostion = useRef(new THREE.Vector3());

//   useEffect(() => {
//     if (!targetPosition) return;

//     const [x, _, z] = targetPosition;
//     currentTargetPostion.current.set(x, 0, z); // Lưu vị trí target mới
//     currentCameraPosition.current.copy(camera.position); // lưu vị trí camera hiện tại
//   }, [targetPosition, camera]);

//   // const lastAzimuthalAngleRef = useRef<number | null>(null);

//   // useFrame(() => {
//   //   const controls = controlsRef.current;
//   //   if (!controls) return;

//   //   // Lấy góc hiện tại
//   //   const azimuthal = controls.getAzimuthalAngle();
//   //   const angleDeg = (THREE.MathUtils.radToDeg(azimuthal) + 360) % 360;

//   //   // Nếu góc xoay thay đổi (chỉ khi người dùng xoay camera)
//   //   if (
//   //     lastAzimuthalAngleRef.current === null ||
//   //     Math.abs(lastAzimuthalAngleRef.current - azimuthal) > 0.001 // ngưỡng nhỏ
//   //   ) {
//   //     lastAzimuthalAngleRef.current = azimuthal;

//   //     // Gọi khi thực sự xoay
//   //     // Only update if the user is interacting

//   //     onAngleChange?.(angleDeg);
//   //     dispatch(updateCurrentAngleMaster(angleDeg));
//   //   }
//   // });
//   const lastAzimuthalAngleRef = useRef<number | null>(null);

//   useFrame(() => {
//     const controls = controlsRef.current;
//     if (!controls) return;

//     // Luôn update controls
//     controls.update();

//     const azimuthal = controls.getAzimuthalAngle();
//     const angleDeg = (THREE.MathUtils.radToDeg(azimuthal) + 360) % 360;

//     const hasAngleChanged =
//       lastAzimuthalAngleRef.current === null ||
//       Math.abs(lastAzimuthalAngleRef.current - azimuthal) > 0.001;

//     if (hasAngleChanged) {
//       lastAzimuthalAngleRef.current = azimuthal;

//       // Luôn gọi (ví dụ như cập nhật redux chính)
//       onAngleChange?.(angleDeg);
//       dispatch(updateCurrentAngleMaster(angleDeg));

//       // ✅ CHỈ gọi minimap angle khi người dùng đang xoay = chuột
//       const STATE_ROTATE = 0;
//       if (controls.state === STATE_ROTATE) {
//         onAngleChangeForMinimap?.(angleDeg);
//       }
//     }
//   });

//   return (
//     <OrbitControls
//       ref={controlsRef}
//       enablePan={false}
//       enableDamping={true}
//       dampingFactor={0.3}
//       autoRotate={autoRotate}
//       autoRotateSpeed={autoRotateSpeed === null ? 0 : autoRotateSpeed}
//       rotateSpeed={-0.15}
//     />
//   );
// };

// export default CamControls;
import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRaycaster } from "../../hooks/useRaycaster";
import gsap from "gsap";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import { updateCurrentAngleMaster } from "../../redux/slices/PanoramaSlice";

type CamControlsProps = {
  targetPosition?: [number, number, number] | null;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.RefObject<any>;
  autoRotate: boolean;
  autoRotateSpeed: number | null;
  onAngleChange?: (angle: number) => void;
  onAngleChangeForMinimap?: (angle: number) => void;
};

const zoomLevels = [75, 60, 45, 30];

const CamControls: React.FC<CamControlsProps> = ({
  targetPosition,
  sphereRef,
  cameraRef,
  controlsRef,
  autoRotate,
  autoRotateSpeed,
  onAngleChange,
  onAngleChangeForMinimap,
}) => {
  const { gl, camera } = useThree();
  const canvas = gl.domElement;
  const { getIntersectionPoint } = useRaycaster();
  const [zoomIndex, setZoomIndex] = useState(0);
  const targetLookAt = useRef(new THREE.Vector3());
  const dispatch = useDispatch<AppDispatch>();

  const lastAzimuthalAngleRef = useRef<number | null>(null);
  const isUserRotatingRef = useRef(false);

  // Gán cameraRef nếu có
  useEffect(() => {
    if (cameraRef && camera instanceof THREE.PerspectiveCamera) {
      cameraRef.current = camera;
    }
  }, [cameraRef, camera]);

  // Wheel zoom
  const handleMouseWheel = useCallback(
    (e: WheelEvent) => {
      const point = getIntersectionPoint(e, sphereRef.current);
      if (point) {
        targetLookAt.current.copy(point);
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
    [getIntersectionPoint, sphereRef]
  );

  useEffect(() => {
    canvas.addEventListener("wheel", handleMouseWheel);
    return () => {
      canvas.removeEventListener("wheel", handleMouseWheel);
    };
  }, [handleMouseWheel]);

  // Gán vị trí target
  const currentCameraPosition = useRef(new THREE.Vector3());
  const currentTargetPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!targetPosition) return;

    const [x, _, z] = targetPosition;
    currentTargetPosition.current.set(x, 0, z);
    currentCameraPosition.current.copy(camera.position);
  }, [targetPosition, camera]);

  // Lắng nghe sự kiện bắt đầu & kết thúc rotate
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      isUserRotatingRef.current = true;
    };
    const handleEnd = () => {
      isUserRotatingRef.current = false;
    };

    controls.addEventListener("start", handleStart);
    controls.addEventListener("end", handleEnd);

    return () => {
      controls.removeEventListener("start", handleStart);
      controls.removeEventListener("end", handleEnd);
    };
  }, []);

  // Cập nhật góc
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.update();

    const azimuthal = controls.getAzimuthalAngle();
    const angleDeg = (THREE.MathUtils.radToDeg(azimuthal) + 360) % 360;

    const hasAngleChanged =
      lastAzimuthalAngleRef.current === null ||
      Math.abs(lastAzimuthalAngleRef.current - azimuthal) > 0.001;

    if (hasAngleChanged) {
      lastAzimuthalAngleRef.current = azimuthal;

      // Luôn cập nhật Redux & callback chính
      onAngleChange?.(angleDeg);
      dispatch(updateCurrentAngleMaster(angleDeg));

      // ✅ Chỉ update minimap khi người dùng rotate
      if (isUserRotatingRef.current) {
        onAngleChangeForMinimap?.(angleDeg);
      }
      console.log(`Angle hieenj taij : ${angleDeg} `);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.3}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed === null ? 0 : autoRotateSpeed}
      rotateSpeed={-0.15}
    />
  );
};

export default CamControls;
