import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useState } from "react";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { HotspotNavigation } from "../../redux/slices/HotspotSlice";

type GroundHotspotProps = {
  hotspotNavigation: HotspotNavigation;
  setCurrentHotspotId?: (val: string | null) => void;
};

const MarkerModel = ({
  hotspotNavigation,
  setCurrentHotspotId,
}: GroundHotspotProps) => {
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Đang thử nghiệm
   */
  // const [isClicked, setIsClicked] = useState(false);
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);
  const { scene } = useGLTF(import.meta.env.BASE_URL + "mapMarker.glb");
  useFrame(() => {
    if (scene) {
      scene.rotation.y += 0.01;
    }
  });
  return (
    <>
      <group
        scale={10}
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
        <primitive object={scene} />
        <ambientLight color={"#fff"} intensity={5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
      </group>

      {isOpenHotspotOption ? (
        <OptionHotspot
          hotspotId={hotspotNavigation.id}
          setCurrentHotspotId={setCurrentHotspotId ?? (() => {})}
          onClose={() => {
            setIsOpenHotspotOption(false);
          }}
          position={[
            hotspotNavigation.positionX,
            hotspotNavigation.positionY,
            hotspotNavigation.positionZ,
          ]}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default MarkerModel;
