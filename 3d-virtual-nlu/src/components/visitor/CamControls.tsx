import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
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
  radius: number;
  targetPosition?: [number, number, number] | null; //test
  sphereRef: React.RefObject<THREE.Mesh | null>;
};

const CamControls: React.FC<CamControlsProps> = ({
  radius,
  targetPosition,
  sphereRef,
}) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!targetPosition) return;

    const [x, _, z] = targetPosition;

    const moveVector = new THREE.Vector3(x, 0, z); //test vector.

    gsap.to(camera.position, {
      x,
      y: 0,
      z: z + 0.1,
      duration: 2.5,
      ease: "expo.out",
      onUpdate: () => {
        controlsRef.current.target.set(x, 0, z); // Cập nhật vị trí target của OrbitControls
      },
      onComplete: () => {
        console.log("Di chuyển xong, cập nhật vị trí hình cầu! [CamControls]");
        console.log("✅ Camera Position Sau Khi Di Chuyển:", camera.position);
        console.log(
          "✅ Target Sau Khi Di Chuyển:",
          controlsRef.current?.target
        );
        if (sphereRef.current) {
          sphereRef.current.position.copy(moveVector); // Cập nhật vị trí hình cầu
          console.log(
            "🟠 Vị trí Tâm Quả Cầu Sau Khi Cập Nhật:",
            sphereRef.current.position
          );
        }

        setTimeout(() => {
          console.log("Thiết lập hệ toạ độ mới");
          camera.position.sub(moveVector); // Đặt camera về vị trí mới
          controlsRef.current.target.sub(moveVector); // Đặt lại target về tâm cầu
          if (sphereRef.current) {
            sphereRef.current.position.set(0, 0, 0);
          }
        }, 500);
      },
    });
  }, [targetPosition, camera, sphereRef]);

  // useFrame(() => {
  //   if (!controlsRef.current) return;

  //   // OrbitControls cập nhật vị trí camera trước
  //   controlsRef.current.update();

  //   // Camera gốc luôn nhìn vào tâm (0,0,0), nhưng ta cần nó quay lưng lại
  //   const viewDir = new THREE.Vector3()
  //     .subVectors(camera.position, new THREE.Vector3(0, 0, 0))
  //     .normalize();

  //   // Xoay 180 độ - tính vị trí mới mà camera nên nhìn
  //   const newTarget = new THREE.Vector3().copy(camera.position).add(viewDir);

  //   // Bắt camera nhìn về hướng mới
  //   camera.lookAt(newTarget);
  // });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      // enableZoom={true}
      enableDamping={true}
      dampingFactor={0.3}
      // zoomSpeed={-1}
      rotateSpeed={-0.15}
      // minDistance={radius - 80}
      // maxDistance={radius - 20}
    />
  );
};

export default CamControls;
