import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
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

extend({ CrossFadeMaterial });

type CrossFadeSphereProps = {
  textureUrls: [string, string]; //ảnh hiện tại và ảnh mới.
  onFadeComplete?: () => void;
};

const CrossFadeSphere: React.FC<CrossFadeSphereProps> = ({
  textureUrls,
  onFadeComplete,
}) => {
  const materialRef = useRef<any>(null);
  const [tex1, tex2] = useTexture(textureUrls);
  const meshRef = useRef<THREE.Mesh>(null);

  const [progress, setProgress] = useState(0);
  const [fadeDone, setFadeDone] = useState(false);

  /**
   * textureUrl[0] : Ảnh hiện tại.
   * textureUrl[1] : Xuất hiện khi người thay đổi texture mới.
   */
  useEffect(() => {
    setProgress(0);
    setFadeDone(false);
  }, [textureUrls[1]]);

  //Xử lý animate mixRatio mỗi frame.
  useFrame((_, delta) => {
    if (fadeDone) return;
    const newProgress = Math.min(progress + delta * 0.5, 1); //2s fade.
    setProgress(newProgress);

    if (materialRef.current) {
      materialRef.current.mixRatio = newProgress;
    }
    if (newProgress >= 1 && !fadeDone) {
      setFadeDone(true);
      onFadeComplete?.();
    }
  });

  return <div>CrossFadeSphere</div>;
};

export default CrossFadeSphere;
