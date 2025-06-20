import { Sphere, Stats, shaderMaterial, useTexture } from "@react-three/drei";
import { ThreeEvent, useFrame, extend } from "@react-three/fiber";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 *  Lớp này sử dụng cho việc :
 * + Xử lý ánh sáng, texture ~ liên quan đến ảnh panorama
 * + Tập trung cho việc hiển thị.
 *
 */
const CrossFadeMaterial = shaderMaterial(
  {
    //Uniform: Chứa 2 ảnh. Progres: 0 tức là toàn bộ là Texture1, 1: tức là toàn bộ là texture2.
    uTexture1: null as THREE.Texture | null,
    uTexture2: null as THREE.Texture | null,
    uProgress: 0,
    uAmbientLight: new THREE.Color(0xffffff),
  },
  //Vertex Shader .gsgl
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);;
    }
     `,
  //Fragment Shader .gsgl
  `
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform float uProgress;
    uniform vec3 uAmbientLight;

    varying vec2 vUv;

    void main() {
      vec4 tex1 = texture2D(uTexture1, vUv);
      vec4 tex2 = texture2D(uTexture2, vUv);
      vec4 baseColor = mix(tex1, tex2, uProgress);

      vec3 light = uAmbientLight;
      vec3 finalColor= baseColor.rgb * light;
      gl_FragColor = vec4(finalColor, baseColor.a);
    
    }
    
    `
);
extend({ CrossFadeMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    crossFadeMaterial: JSX.IntrinsicElements["shaderMaterial"] & {
      uTexture1?: THREE.Texture | null;
      uTexture2?: THREE.Texture | null;
      uProgress?: number;
      uAmbientLight?: THREE.Color;
    };
  }
}

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
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  // const [prevTextureUrl, setPrevTextureUrl] = useState(textureCurrent);

  const [textures, setTextures] = useState<
    [THREE.Texture | null, THREE.Texture | null] | null
  >(null);

  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sphereRef && meshRef.current) {
      sphereRef.current = meshRef.current;
      // console.log("sphereRef đã được gán: ", sphereRef.current);
    }
  }, [sphereRef]);

  useEffect(() => {
    const load = async () => {
      try {
        const loader = new THREE.TextureLoader();
        const texNew = await loader.loadAsync(textureCurrent);

        if (!textures) {
          setTextures([texNew, null]);
        } else {
          const [prevTex] = textures;
          setTextures([prevTex, texNew]);
          setProgress(0);
          progressRef.current = 0;
        }
      } catch (err: any) {
        console.error(err);
      }
    };
    load();
  }, [textureCurrent]);

  useFrame((_, delta) => {
    if (!textures || !textures[1]) return;

    if (progressRef.current < 1) {
      progressRef.current = Math.min(progressRef.current + delta, 1);
      setProgress(progressRef.current);
    }

    if (progressRef.current >= 1 && textures[1]) {
      setTextures([textures[1], null]);

      if (materialRef.current) {
        materialRef.current.uTexture1 = textures[1];
        materialRef.current.uTexture2 = null; // hoặc dùng emptyTexture
        materialRef.current.uProgress = 0;
      }

      setProgress(0);
      progressRef.current = 0;
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
        <crossFadeMaterial
          ref={materialRef}
          uTexture1={textures?.[0] || null}
          uTexture2={textures?.[1] || null}
          uProgress={progress}
          side={THREE.BackSide}
          uAmbientLight={new THREE.Color().setScalar(lightIntensity)} // ánh sáng môi trường
        />
      </Sphere>
    </>
  );
};

export default TourScene;
