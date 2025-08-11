import { useTexture } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const useProgressiveTexture = (urls: { low: string; high: string }) => {
  const [currentTex, setCurrentTex] = useState<THREE.Texture | null>(null);

  const lowLoadedTex = useRef(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(urls.low, (lowTex) => {
      lowTex.wrapT = THREE.RepeatWrapping;
      lowTex.wrapS = THREE.RepeatWrapping;
      setCurrentTex(lowTex);
      lowLoadedTex.current = true;

      //Tải ảnh cao hơn 1s:
      setTimeout(() => {});
    });
  }, [urls]);

  return currentTex;
};
