import { Sphere, shaderMaterial, useTexture } from "@react-three/drei";
import { ThreeEvent, useFrame, extend } from "@react-three/fiber";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";
import { RootState } from "../../redux/Store";

/**
 *  Lớp này sử dụng cho việc :
 * + Xử lý ánh sáng, texture ~ liên quan đến ảnh panorama
 * + Tập trung cho việc hiển thị.
 *
 */

const CrossFadeMaterial = shaderMaterial(
  {
    //Uniform: Chứa 2 ảnh. Progress: 0 tức là toàn bộ là Texture1, 1: tức là toàn bộ là texture2.
    //YawOffset: giá trị cho việc xoay texture trên hình cầu theo trục Y.
    uTexture1: null as THREE.Texture | null,
    uTexture2: null as THREE.Texture | null,
    uProgress: 0,
    uYawOffset1: 0,
    uYawOffset2: 0,
    uAmbientLight: new THREE.Color(0xffffff),
  },
  //Vertex Shader .gsgl
  `
    varying vec2 vUv;
    uniform float uYawOffset;
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
    uniform float uYawOffset1;
    uniform float uYawOffset2;
    uniform vec3 uAmbientLight;

    varying vec2 vUv;

    void main() {
      //Dịch uv theo yawOffset (Phần trăm 0.0 - 1.0 <=> 0 - 2Pi.)
      vec2 uv1 = vec2(mod(vUv.x + uYawOffset1, 1.0 ), vUv.y);
      vec2 uv2 = vec2(mod(vUv.x + uYawOffset2, 1.0), vUv.y );

      vec4 tex1 = texture2D(uTexture1, uv1);
      vec4 tex2 = texture2D(uTexture2, uv2);
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
      uYawOffset1?: number;
      uYawOffset2?: number;
      uAmbientLight?: THREE.Color;
    };
  }
}

interface TourSceneProps {
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  textureCurrent: string;
  yawOffsetCurrent: number;
  lightIntensity: number;
  /**
   * Input: Nhận sự kiện click chuột từ CreateTourStep2
   * Output: Trả về giá trị raycast x,y,z.
   */
  onPointerDown?: (e: ThreeEvent<PointerEvent>, point: THREE.Vector3) => void;
  nodeId?: string;
  onTextureReady?: () => void;
}

const TourScene: React.FC<TourSceneProps> = ({
  radius,
  sphereRef,
  textureCurrent,
  yawOffsetCurrent,
  lightIntensity,
  onPointerDown,
  onTextureReady,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const progressRef = useRef(0);

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  const currentPanorama = panoramaList.find(
    (pano) => pano.id === currentSelectId
  );

  const [textures, setTextures] = useState<
    [THREE.Texture | null, THREE.Texture | null] | null
  >(null);

  const [yawOffsetList, setYawOffsetList] = useState<[number | 0, number | 0]>([
    0, 0,
  ]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sphereRef && meshRef.current) {
      sphereRef.current = meshRef.current;
    }
  }, [sphereRef]);

  useEffect(() => {
    const load = async () => {
      try {
        const loader = new THREE.TextureLoader();
        const texNew = await loader.loadAsync(textureCurrent);
        const yawNew = yawOffsetCurrent / (2 * Math.PI);

        if (!textures) {
          setTextures([texNew, null]);
          setYawOffsetList([yawNew, 0]);
          onTextureReady?.();
        } else {
          const [prevTex] = textures;
          const [prevYaw, _] = yawOffsetList;

          setTextures([prevTex, texNew]);
          setYawOffsetList([prevYaw, yawNew]);
          setProgress(0);
          progressRef.current = 0;
        }
      } catch (err: any) {
        console.error(err);
      }
    };
    load();
  }, [textureCurrent, yawOffsetCurrent]);

  useEffect(() => {
    console.log(
      `[DEBUG] yawOffsetCurrent cho panorama ${currentPanorama?.id}:`,
      yawOffsetCurrent,
      `(≈ ${((yawOffsetCurrent / (2 * Math.PI)) * 360).toFixed(2)}°)`
    );
  }, [yawOffsetCurrent, currentPanorama?.id]);

  /**
   * Texture thực hiện việc đổi.
   * delta: Thời gian tính bằng giây giữa 2 Frame liên tiếp
   * 1. Mỗi Frame , progress tăng delta * 0.5. => Tăng 0.5 đơn vị
   * => Tổng các lần delta + lại = 1 thì hoàn tất.
   * Total time = 1 / 0.5 = 2s
   */

  useFrame((_, delta) => {
    if (!textures || !textures[1]) return;

    if (progressRef.current < 1) {
      progressRef.current = Math.min(progressRef.current + delta * 0.5, 1);
      setProgress(progressRef.current);
    }

    if (materialRef.current) {
      materialRef.current.uProgress = progressRef.current;
      materialRef.current.uYawOffset1 = yawOffsetList[0];
      materialRef.current.uYawOffset2 = yawOffsetList[1];
    }

    if (progressRef.current >= 1 && textures[1]) {
      setTextures([textures[1], null]);
      setYawOffsetList([yawOffsetList[1], 0]);
      setProgress(0);
      if (materialRef.current) {
        materialRef.current.uTexture1 = textures[1];
        materialRef.current.uTexture2 = null;
        materialRef.current.uProgress = 0;

        materialRef.current.uYawOffset1 = yawOffsetList[1];
        materialRef.current.uYawOffset2 = yawOffsetList[1];
        onTextureReady?.();
      }

      progressRef.current = 0;
    }
  });

  // Gửi sự kiện click chuột kèm điểm raycaste (x,y,z) về CreateTourStep2.
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!sphereRef.current) return;
    onPointerDown?.(e, e.point);
  };
  // -------------TEST 23.6

  return (
    <>
      <Sphere
        ref={sphereRef}
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
          uYawOffset1={yawOffsetList[0]}
          uYawOffset2={yawOffsetList[1]}
        />
      </Sphere>
    </>
  );
};

export default TourScene;
