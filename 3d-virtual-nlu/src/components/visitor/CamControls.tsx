import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * Nguyên lý hoạt động của OrbitControls:
 * 1. Luôn setup camera hướng về target tâm cầu.
 * 2. Xoay: tức là xoay camera đi quanh cầu, nếu coi tâm là mặt trời thì camera là trái đất.
 * 3. Zoom: nôm na là đưa trái đất về gần mặt trời hơn.
 * => Vậy thì ta cần lật ngược camera lại 180 độ để camera nhìn về hướng ngược lại.
 *
 */

type CamControlsProps = {
  radius: number;
};

const CamControls: React.FC<CamControlsProps> = ({ radius }) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!controlsRef.current) return;

    // OrbitControls cập nhật vị trí camera trước
    controlsRef.current.update();

    // Camera gốc luôn nhìn vào tâm (0,0,0), nhưng ta cần nó quay lưng lại
    const viewDir = new THREE.Vector3()
      .subVectors(camera.position, new THREE.Vector3(0, 0, 0))
      .normalize();

    // Xoay 180 độ - tính vị trí mới mà camera nên nhìn
    const newTarget = new THREE.Vector3().copy(camera.position).add(viewDir);

    // Bắt camera nhìn về hướng mới
    camera.lookAt(newTarget);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableDamping={true}
      dampingFactor={0.3}
      zoomSpeed={-1}
      rotateSpeed={-0.25}
      minDistance={radius - 80}
      maxDistance={radius - 5}
    />
  );
};

export default CamControls;
