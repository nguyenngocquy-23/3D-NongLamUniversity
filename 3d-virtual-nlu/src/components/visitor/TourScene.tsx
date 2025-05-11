// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { useThree } from "@react-three/fiber";

// /**
//  * Vấn đề cần xem xét:
//  * Không hiểu sao khi dùng thuần drei nó lại trả Raycaster theo kiểu x, y luôn =0.
//  */

// interface TourSceneProps {
//   radius: number;
//   sphereRef: React.RefObject<THREE.Mesh | null>;
//   textureCurrent: string;
//   lightIntensity: number;
// }

// const TourScene: React.FC<TourSceneProps> = ({
//   radius,
//   sphereRef,
//   textureCurrent,
//   lightIntensity,
// }) => {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const { scene } = useThree();

//   useEffect(() => {
//     // Load texture
//     const texture = new THREE.TextureLoader().load(textureCurrent, () => {
//       texture.wrapS = THREE.RepeatWrapping;
//       texture.repeat.x = -1; // Đảo chiều panorama
//     });

//     const geometry = new THREE.SphereGeometry(radius, 128, 128);
//     const material = new THREE.MeshStandardMaterial({
//       map: texture,
//       side: THREE.BackSide,
//       metalness: 0,
//       roughness: 1,
//     });

//     const mesh = new THREE.Mesh(geometry, material);

//     scene.add(mesh);
//     meshRef.current = mesh;

//     if (sphereRef) {
//       sphereRef.current = mesh;
//       console.log("sphereRef đã được gán (raw): ", mesh);
//     }

//     // Light
//     const ambientLight = new THREE.AmbientLight(0xffffff, lightIntensity);
//     const directionalLight = new THREE.DirectionalLight(
//       0xffffff,
//       lightIntensity
//     );
//     directionalLight.position.set(5, 5, 5);
//     scene.add(ambientLight);
//     scene.add(directionalLight);

//     // Optional: Debug axes
//     const axesHelper = new THREE.AxesHelper(100);
//     scene.add(axesHelper);

//     return () => {
//       scene.remove(mesh);
//       scene.remove(ambientLight);
//       scene.remove(directionalLight);
//       scene.remove(axesHelper);
//       geometry.dispose();
//       material.dispose();
//       texture.dispose();
//     };
//   }, [textureCurrent, radius, scene, sphereRef, lightIntensity]);

//   return null; // Không cần JSX vì xử lý thủ công
// };

// export default TourScene;
// drei nè
import { Sphere } from "@react-three/drei";
import { ThreeEvent, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as THREE from "three";
import {
  addModelHotspot,
  addNavigationHotspot,
} from "../../redux/slices/HotspotSlice";
import { AppDispatch } from "../../redux/Store";

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

  // const dispatch = useDispatch<AppDispatch>();
  // const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
  //   if (!assignable || !sphereRef.current) return;
  //   const { x, y, z } = e.point;
  //   dispatch(
  //     addNavigationHotspot({
  //       nodeId: nodeId,
  //       iconId: 1,
  //       positionX: x,
  //       positionY: y,
  //       positionZ: z,
  //       type: 1,
  //       scale: 1,
  //       pitchX: 0,
  //       yawY: 0,
  //       rollZ: 0,
  //       targetNodeId: nodeId,
  //     })
  //   );

  //   setAssignable(false);
  // };
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!assignable || !sphereRef.current) return;

    onPointerDown?.(e, e.point); // Gửi sự kiện click chuột kèm điểm raycaste (x,y,z) về CreateTourStep2.
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

// useEffect(() => {
//   const geometry = new THREE.SphereGeometry(radius, 128, 128);

//   // const texture = new THREE.TextureLoader().load("/khoa.jpg");
//   const texture = new THREE.TextureLoader().load(textureCurrent);

//   texture.wrapS = THREE.RepeatWrapping;
//   texture.repeat.x = -1;

//   const material = new THREE.MeshStandardMaterial({
//     map: texture,
//     side: THREE.BackSide,
//   });

//   const sphere = new THREE.Mesh(geometry, material);
//   sphere.name = "virtual-sphere";

//   if (sphereRef) {
//     sphereRef.current = sphere;
//     console.log(
//       "sphereRef.current được gán trong TourScene nè",
//       sphereRef.current
//     );
//   }

//   const axesHelper = new THREE.AxesHelper(100);

//   scene.add(sphere);
//   scene.add(axesHelper);

//   /**
//    * Xử lý hậu kỳ ánh sáng cho scene.
//    */
//   // const ambientLight = new THREE.AmbientLight(0x404040, 1);
//   // scene.add(ambientLight);

//   return () => {
//     scene.remove(sphere);
//     geometry.dispose();
//     material.dispose();
//     texture.dispose();
//   };
// }, [radius, scene, sphereRef]);
