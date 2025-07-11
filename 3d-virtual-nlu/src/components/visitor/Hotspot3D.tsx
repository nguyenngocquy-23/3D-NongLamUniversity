import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { HotspotInformation } from "../../redux/slices/HotspotSlice";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { useGLTF } from "@react-three/drei";
import { useModelCache } from "../../contexts/ImageCacheContext";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
type Hotspot3DProps = {
  hotspotInfo: HotspotInformation;
};

const Hotspot3D: React.FC<Hotspot3DProps> = ({ hotspotInfo }) => {
  const modelCache = useModelCache();
  const maxSizeRef = useRef(10 * hotspotInfo.scale);
  const scaleFactor = (RADIUS_SPHERE - maxSizeRef.current) / 100;

  const icons = useSelector((state: RootState) => state.data.icons);
  const iconObj = icons.find((i) => i.id == hotspotInfo.iconId);
  const iconUrl = iconObj ? iconObj.url : "";

  const [isClicked, setClicked] = useState(false);
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);

  const gltf = useGLTF(iconObj.url);

  const clonedScene = useMemo(() => {
    if (!gltf || Array.isArray(gltf) || !("scene" in gltf)) return null;

    const cache = modelCache.current[iconObj.url];

    const originalScene = cache?.glbScene ?? gltf?.scene;

    const scene = originalScene.clone(true);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry = mesh.geometry.clone();

        if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            // mesh.material.emissive.set("#347433"); // Chọn màu phát sáng cho hotspot
            mesh.material.emissiveIntensity = 10; // Độ sáng tự phát
            // mesh.material.color.set("#347433"); // Không có màu gốc (chỉ sáng bằng emissive)

            mesh.material.envMap = null;
            mesh.material.envMapIntensity = 0;
            mesh.material.metalness = 0;
            mesh.material.roughness = 1;
          }
        }
      }
    });

    return scene;
  }, [gltf, modelCache]);

  return (
    <group
      scale={hotspotInfo.scale}
      position={[
        hotspotInfo.positionX * scaleFactor,
        hotspotInfo.positionY * scaleFactor,
        hotspotInfo.positionZ * scaleFactor,
      ]}
      rotation={[
        THREE.MathUtils.degToRad(hotspotInfo.pitchX),
        THREE.MathUtils.degToRad(hotspotInfo.yawY),
        THREE.MathUtils.degToRad(hotspotInfo.rollZ),
      ]}
      onClick={(e) => {
        e.stopPropagation();
        setClicked((preState) => !preState);
      }}
      onContextMenu={(e) => {
        e.nativeEvent.preventDefault(); // 👈 bắt buộc
        setIsOpenHotspotOption(true);
      }}
    >
      {clonedScene && <primitive object={clonedScene} />}

      <ambientLight color={"#fff"} intensity={0.3} />
    </group>
  );
};

export default Hotspot3D;
