import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRaycaster } from "../../hooks/useRaycaster";
import gsap from "gsap";
/**
 * Nguyên lý hoạt động của OrbitControls:
 * 1. Luôn setup camera hướng về target tâm cầu.
 * 2. Xoay: tức là xoay camera đi quanh cầu, nếu coi tâm là mặt trời thì camera là trái đất.
 * 3. Zoom: nôm na là đưa trái đất về gần mặt trời hơn.
 * => Vậy thì ta cần lật ngược camera lại 180 độ để camera nhìn về hướng ngược lại.
 *
 */

type CamControlsProps = {
  targetPosition?: [number, number, number] | null; //test
  sphereRef: React.RefObject<THREE.Mesh | null>;
};
const zoomLevels = [75, 60, 45, 30];

const CamControls: React.FC<CamControlsProps> = ({
  targetPosition,
  sphereRef,
}) => {
  const { gl } = useThree();
  const canvas = gl.domElement;
  const controlsRef = useRef<any>(null); //OrbitControls
  const { camera } = useThree();
  const { getIntersectionPoint } = useRaycaster();
  const [zoomIndex, setZoomIndex] = useState(0);
  const targetLookAt = useRef(new THREE.Vector3());

  /**
   * Xử lý sự kiện chuột : Zoom bằng cách thay đổi FOV để tránh méo ảnh.
   */
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

  /**
   *  Tính năng: Di chuyển giữa các node hotspot.
   *  + Điểm hotspot khi click.
   *  + Để tạo cảm giác move tới, ta thực hiện việc cho camera đi từ tâm đến hotspot.
   *   Với hotspot di chuyển, ta sẽ cho camera đi đến hotspot và camera luôn luôn nằm trên mặt phẳng XZ tạo cảm giác giống mắt người.
   *
   */

  // B1. Lưu vị trí cũ và target mới.
  const currentCameraPosition = useRef(new THREE.Vector3());
  const currentTargetPostion = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!targetPosition) return;

    const [x, _, z] = targetPosition;
    currentTargetPostion.current.set(x, 0, z); // Lưu vị trí target mới
    currentCameraPosition.current.copy(camera.position); // lưu vị trí camera hiện tại
  }, [targetPosition, camera]);

  useFrame(() => {
    if (!targetPosition || !controlsRef.current) return;

    // Tỉ lệ di chuyển camera
    // const lerpSpeed = 0.1;
    // camera.position.lerp(currentCameraPosition.current, lerpSpeed);
    // controlsRef.current.target.lerp(currentTargetPostion.current, lerpSpeed); // Cập nhật vị trí target của OrbitControls

    // if (sphereRef.current) {
    //   sphereRef.current.position.lerp(currentTargetPostion.current, lerpSpeed); // Cập nhật vị trí hình cầu
    // }

    // if (camera.position.distanceTo(currentTargetPostion.current) < 0.1) {
    //   camera.position.copy(currentTargetPostion.current); // Đặt camera về vị trí mới
    //   controlsRef.current.target.copy(currentTargetPostion.current); // Đặt lại target về tâm cầu
    // }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.3}
      rotateSpeed={-0.15}
    />
  );
};

export default CamControls;
