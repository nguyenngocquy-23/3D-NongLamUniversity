import { Sphere, shaderMaterial, useTexture } from "@react-three/drei";
import { ThreeEvent, useFrame, extend } from "@react-three/fiber";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";
import { RootState } from "../../redux/Store";
import { radianToTexture } from "../../utils/MathUtils";

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
    uBrightness: 0,
    uContrast: 1,
    uSaturation: 1,
    uGrayscale: 0,
    uExposure: 1,
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

    uniform float uBrightness; //[-1.0 , 1.0] 
    uniform float uContrast; //[0.5, 2] 
    uniform float uSaturation; //[0.0 , 2.0] 
    uniform float uGrayscale; //[0 , 1.0] 
    uniform float uExposure; //[0 , 2.0] 

    varying vec2 vUv;

    void main() {
      //Dịch uv theo yawOffset (Phần trăm 0.0 - 1.0 <=> 0 - 2Pi.)
      vec2 uv1 = vec2(mod(vUv.x + uYawOffset1 , 1.0 ), vUv.y);
      vec2 uv2 = vec2(mod(vUv.x + uYawOffset2 , 1.0), vUv.y );
      
      vec4 tex1 = texture2D(uTexture1, uv1);
      vec4 tex2 = texture2D(uTexture2, uv2);
      vec4 baseColor = mix(tex1, tex2, uProgress);

      vec3 color = baseColor.rgb;
      //Image effect
      color *= uExposure;
      color += uBrightness;
      color = (color - 0.5) * uContrast + 0.5;
      vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
      color = mix(color, gray, uGrayscale);
      float avg = (color.r + color.g + color.b) / 3.0;
      color = mix(vec3(avg), color, uSaturation);

      vec3 light = uAmbientLight;
      vec3 finalColor= color * light;
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
      uBrightness?: number;
      uContrast?: number;
      uSaturation?: number;
      uGrayscale?: number;
      uExposure?: number;
    };
  }
}

interface TourSceneProps {
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
  textureCurrent: string;
  yawOffsetCurrent: number;
  lightIntensity: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: number;
  exposure?: number;
  /**
   * Input: Nhận sự kiện click chuột từ CreateTourStep2
   * Output: Trả về giá trị raycast x,y,z.
   */
  onPointerDown?: (e: ThreeEvent<PointerEvent>, point: THREE.Vector3) => void;
  nodeId?: string;
  onTextureReady?: () => void;
  imageRef?: React.RefObject<
    Record<string, { img: HTMLImageElement; objectUrl: string }>
  >;
}

const TourScene: React.FC<TourSceneProps> = ({
  radius,
  sphereRef,
  textureCurrent,
  yawOffsetCurrent,
  lightIntensity,
  brightness,
  contrast,
  saturation,
  grayscale,
  exposure,
  onPointerDown,
  onTextureReady,
  imageRef,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const progressRef = useRef(0);
  const prevTextureRef = useRef<string | null>(null);
  const prevYawOffsetRef = useRef<number | null>(null);

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
      const yawNew = radianToTexture(yawOffsetCurrent);

      // Nếu texture không đổi, chỉ cần cập nhật yawOffset (không load lại texture hay crossfade)
      if (textureCurrent === prevTextureRef.current) {
        setYawOffsetList(([_, yaw2]) => [yawNew, yaw2]);
        if (materialRef.current) {
          materialRef.current.uYawOffset1 = yawNew;
        }
        return;
      }

      try {
        let texNew: THREE.Texture | undefined;

        if (imageRef && imageRef.current && imageRef.current[textureCurrent]) {
          const preloadedImage = imageRef.current[textureCurrent];
          texNew = new THREE.Texture(preloadedImage.img);
          texNew.needsUpdate = true;
        } else {
          const loader = new THREE.TextureLoader();
          texNew = await loader.loadAsync(textureCurrent);
        }
        texNew.wrapS = THREE.RepeatWrapping;
        texNew.wrapT = THREE.RepeatWrapping;

        if (!texNew) {
          console.warn("Texture not preloaded:", textureCurrent);
          return;
        }

        // TEST ========

        if (!textures) {
          setTextures([texNew, null]);
          setYawOffsetList([yawNew, 0]);
          onTextureReady?.();
        } else {
          const [prevTex] = textures;
          const [prevYaw] = yawOffsetList;

          setTextures([prevTex, texNew]);
          setYawOffsetList([prevYaw, yawNew]);
          setProgress(0);
          progressRef.current = 0;
        }

        // Cập nhật ref sau khi load xong
        prevTextureRef.current = textureCurrent;
        prevYawOffsetRef.current = yawOffsetCurrent;
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [textureCurrent, yawOffsetCurrent]);

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
          uBrightness={brightness ?? 0}
          uContrast={contrast ?? 1}
          uSaturation={saturation ?? 1}
          uGrayscale={grayscale ?? 0}
          uExposure={exposure ?? 1}
        />
      </Sphere>
    </>
  );
};

export default TourScene;
