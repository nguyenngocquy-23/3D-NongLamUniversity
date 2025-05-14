import { Sphere, shaderMaterial, useTexture } from "@react-three/drei";
import {
  ThreeEvent,
  useLoader,
  useThree,
  extend,
  useFrame,
} from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CrossFadeMaterial = shaderMaterial(
  {
    texture1: null,
    texture2: null,
    mixRatio: 0,
  },
  // vertex shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment shader - trộn texture 1 và texture 2 với tỉ lệ mixRatio
  `
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float mixRatio;
  varying vec2 vUv;
  void main() {
    vec4 tex1 = texture2D(texture1, vUv);
    vec4 tex2 = texture2D(texture2, vUv);
    gl_FragColor = mix(tex1, tex2, mixRatio);
  }
  `
);

CrossFadeMaterial.key = "CrossFadeMaterial";
extend({ CrossFadeMaterial });

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
  nodeId?: string;
}

const TourScene: React.FC<TourSceneProps> = ({
  radius,
  sphereRef,
  textureCurrent,
  lightIntensity,
  onPointerDown,
  nodeId,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useEffect(() => {
    if (sphereRef && meshRef.current) {
      sphereRef.current = meshRef.current;
      console.log("sphereRef đã được gán: ", sphereRef.current);
    }
  }, [sphereRef]);

  const [prevTextureUrl, setPrevTextureUrl] = useState(textureCurrent);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [tex1, tex2] = useTexture([prevTextureUrl, textureCurrent]);

  const texture = useLoader(THREE.TextureLoader, textureCurrent);

  useEffect(() => {
    if (textureCurrent !== prevTextureUrl) {
      setPrevTextureUrl(textureCurrent);
      setFadeProgress(0);
    }
  }, [textureCurrent]);

  useFrame((_, delta) => {
    if (fadeProgress < 1) {
      const newProgress = Math.min(fadeProgress + delta * 0.5, 1);
      setFadeProgress(newProgress);
      if (materialRef.current) {
        materialRef.current.mixRatio = newProgress;
      }
    }
  });

  // Gửi sự kiện click chuột kèm điểm raycaste (x,y,z) về CreateTourStep2.
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!sphereRef.current) return;

    onPointerDown?.(e, e.point);
  };

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
        {/* <CrossFadeMaterial
          ref={materialRef}
          side={THREE.BackSide}
          texture1={tex1}
          texture2={tex2}
          mixRatio={fadeProgress}
        /> */}
      </Sphere>
      <ambientLight intensity={lightIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={lightIntensity} />
      <primitive object={new THREE.AxesHelper(5)} />
    </>
  );
};

export default TourScene;
