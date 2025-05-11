import { Sphere } from "@react-three/drei";
import { ThreeEvent, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 *  Lớp này sử dụng cho việc :
 * + Xử lý ánh sáng, texture ~ liên quan đến ảnh panorama
 * + Tập trung cho việc hiển thị.
 *
 */

interface TourSceneProps {
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  textureCurrent: string;
  lightIntensity: number;
  /**
   * Input: Nhận sự kiện click chuột từ CreateTourStep2
   * Output: Trả về giá trị raycast x,y,z.
   */
  onPointerDown?: (e: ThreeEvent<PointerEvent>, point: THREE.Vector3) => void;

  //Test.
  nodeId: string;
  assignable: boolean;
  setAssignable: (value: boolean) => void;
}

const TourScene: React.FC<TourSceneProps> = ({
  radius,
  sphereRef,
  textureCurrent,
  lightIntensity,
  onPointerDown,
  nodeId,
  assignable,
  setAssignable,
}) => {
  const texture = useLoader(THREE.TextureLoader, textureCurrent);
  const meshRef = useRef<THREE.Mesh>(null);

  // Gửi sự kiện click chuột kèm điểm raycaste (x,y,z) về CreateTourStep2.
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!assignable || !sphereRef.current) return;

    onPointerDown?.(e, e.point);
    setAssignable(false);
  };

  useEffect(() => {
    if (sphereRef && meshRef.current) {
      sphereRef.current = meshRef.current;
      console.log("sphereRef đã được gán: ", sphereRef.current);
    }
  }, [sphereRef]);

  return (
    <>
      <Sphere
        ref={meshRef}
        args={[radius, 128, 128]}
        scale={[-1, 1, 1]}
        onPointerDown={handlePointerDown}
      >
        <meshStandardMaterial
          map={texture}
          side={THREE.BackSide}
          metalness={0.0}
          roughness={1.0}
        />
      </Sphere>
      <ambientLight intensity={lightIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={lightIntensity} />
      <primitive object={new THREE.AxesHelper(5)} />
    </>
  );
};

export default TourScene;
