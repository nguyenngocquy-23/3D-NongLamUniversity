import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useState } from "react";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { HotspotNavigation } from "../../redux/slices/HotspotSlice";

type GroundHotspotProps = {
  hotspotNavigation: HotspotNavigation;
  setCurrentHotspotId?: (val: string | null) => void;
  iconUrl: string;
  scale?: number;
};

const MarkerModel = ({
  hotspotNavigation,
  setCurrentHotspotId,
  iconUrl,
  scale = 5,
}: GroundHotspotProps) => {
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Đang thử nghiệm
   */
  // const [isClicked, setIsClicked] = useState(false);
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);

  const { scene } = useGLTF(iconUrl);

  // clone scene:
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useFrame(() => {
    if (scene) {
      scene.rotation.y += 0.01;
    }
  });
  return (
    <>
      <group
        scale={5}
        position={[
          hotspotNavigation.positionX,
          hotspotNavigation.positionY,
          hotspotNavigation.positionZ,
        ]}
        onContextMenu={() => {
          // Ngăn menu mặc định
          setIsOpenHotspotOption((prev) => !prev);
        }}
      >
        <primitive object={clonedScene} />
        <ambientLight color={"#fff"} intensity={5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
      </group>
    </>
  );
};

export default MarkerModel;
