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

      //Gắn
      const listener = new THREE.AudioListener();
      camera.add(listener);

      //Dọn dẹp khi unmount
      return () => {
        camera.remove(listener);
      };
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
    canvas.addEventListener("wheel", handleMouseWheel, { passive: true });
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
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.3}
      autoRotate={autoRotate ?? false}
      autoRotateSpeed={autoRotateSpeed ?? 0}
      rotateSpeed={-0.15}
    />
  );
};

export default CamControls;
