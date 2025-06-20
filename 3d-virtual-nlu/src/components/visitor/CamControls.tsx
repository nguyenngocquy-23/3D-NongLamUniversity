import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRaycaster } from "../../hooks/useRaycaster";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { getAngleFromXZ } from "../../utils/MathUtils";
import { DEFAULT_ORIGINAL_Z } from "../../utils/Constants";

type CamControlsProps = {
  targetPosition?: [number, number, number] | null;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.RefObject<any>;
  autoRotate: boolean;
  autoRotateSpeed: number | null;
  onAngleChange?: (angle: number) => void;
  cameraRadarRef: React.RefObject<number>;
  currentPano: any;
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
  cameraRadarRef,
  currentPano,
}) => {
  const { gl, camera } = useThree();
  const canvas = gl.domElement;
  const { getIntersectionPoint } = useRaycaster();
  const [zoomIndex, setZoomIndex] = useState(0);
  const targetLookAt = useRef(new THREE.Vector3());
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (currentPano.status === 2) {
      deltaRef.current = 0;
    }
  }, [targetPosition]);

  const isUserRotatingRef = useRef(false);
  const deltaRef = useRef(0);

  const virtualCameraDirRef = useRef<THREE.Vector3 | null>(null); // Camera ảo
  const lastRadarAngleRef = useRef<number>(0); // Hướng radar cuối cùng
  const baseAngleRef = useRef<number>(0); // góc mặc định của node
  const rotationDeltaRef = useRef<number>(0); // góc xoay cộng dồn

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

  // Lắng nghe sự kiện bắt đầu & kết thúc rotate
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);

      // ✅ CHỈ reset hướng ảo nếu đã từng tồn tại
      if (virtualCameraDirRef.current) {
        virtualCameraDirRef.current = dir.clone();

        const angle = getAngleFromXZ(-dir.x, -dir.z);
        lastRadarAngleRef.current = angle;
      }
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

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      isUserRotatingRef.current = true;

      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);

      virtualCameraDirRef.current = dir.clone();
      lastRadarAngleRef.current = getAngleFromXZ(-dir.x, -dir.z);
    };

    controls.addEventListener("start", handleStart);
    return () => {
      controls.removeEventListener("start", handleStart);
    };
  }, []);

  function getSignedAngleDelta(fromDeg: number, toDeg: number): number {
    let delta = ((toDeg - fromDeg + 540) % 360) - 180;
    return delta;
  }

  const justSwitchedRef = useRef(false);
  const skipFrameCountRef = useRef(0);

  useEffect(() => {
    if (!currentPano) return;

    const defaultYaw = getAngleFromXZ(
      currentPano.positionX / DEFAULT_ORIGINAL_Z,
      currentPano.positionZ / DEFAULT_ORIGINAL_Z
    );

    const targetAngle =
      currentPano.status === 2 ? defaultYaw : cameraRadarRef.current; // Góc tổng thể từ cha

    // 👉 Tính vị trí để xoay camera đúng hướng
    const radius = 1;
    const x = -Math.sin((targetAngle * Math.PI) / 180) * radius;
    const z = -Math.cos((targetAngle * Math.PI) / 180) * radius;

    camera.position.set(x, 0, z);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();

    baseAngleRef.current = targetAngle;
    rotationDeltaRef.current = 0;

    if (currentPano.status === 2) {
      onAngleChange?.(0);
    } else {
      justSwitchedRef.current = true;
      skipFrameCountRef.current = 2;
    }
  }, [currentPano?.id]);

  useFrame(() => {
    controlsRef.current?.target.set(0, 0, 0); // hoặc hướng về node chính giữa
    controlsRef.current?.update(); // BẮT BUỘC
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const currentAngle = getAngleFromXZ(-dir.x, -dir.z);

    // ⛔ Skip vài frame đầu để camera ổn định hướng
    if (skipFrameCountRef.current > 0) {
      skipFrameCountRef.current--;
      return;
    }

    if (justSwitchedRef.current) {
      const deltaTemp = getSignedAngleDelta(baseAngleRef.current, currentAngle);

      // Nếu delta quá lớn sau khi chuyển node, camera chưa ổn → chờ tiếp
      if (Math.abs(deltaTemp) > 179) return;

      baseAngleRef.current = currentAngle;
      justSwitchedRef.current = false;
      onAngleChange?.(0);
      return;
    }

    const delta = getSignedAngleDelta(baseAngleRef.current, currentAngle);
    onAngleChange?.(delta);
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
