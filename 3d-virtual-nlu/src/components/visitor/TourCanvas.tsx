import { Canvas } from "@react-three/fiber";
import React from "react";
import VideoMeshComponent from "../admin/VideoMesh";
import UpdateCameraOnResize from "../UpdateCameraOnResize";
import CamControls from "./CamControls";
import GroundHotspotInfo from "./GroundHotspotInfo";
import GroundHotspotModel from "./GroundHotspotModel";
import TourScene from "./TourScene";
import styles from "../../styles/virtualTour.module.css";

const TourCanvas = React.memo(({
  windowSize,
  cursor,
  sphereRef,
  radius,
  defaultNode,
  isRotation,
  targetPosition,
  hotspotInformations,
  hotspotModels,
  hotspotMedias,
}: {
  windowSize: { width: number; height: number };
  cursor: string;
  sphereRef: any;
  radius: number;
  defaultNode: any;
  isRotation: boolean;
  targetPosition: [number, number, number] | null;
  hotspotInformations: any[];
  hotspotModels: any[];
  hotspotMedias: any[];
}) => {
  return (
    <Canvas
      camera={{
        fov: 75,
        aspect: windowSize.width / windowSize.height,
        near: 0.1,
        far: 1000,
        position: [0, 0, 0.0000001],
      }}
      className={styles.tourCanvas}
      // style={{ cursor }}
    >
      <UpdateCameraOnResize />
      <TourScene
        radius={radius}
        sphereRef={sphereRef}
        textureCurrent={defaultNode.url ?? "/khoa.jpg"}
        lightIntensity={defaultNode.lightIntensity}
      />
      <CamControls
        targetPosition={targetPosition}
        sphereRef={sphereRef}
        autoRotate={isRotation}
        autoRotateSpeed={defaultNode.speedRotate}
      />
      {hotspotInformations.map((hotspot, index) => (
        <GroundHotspotInfo key={index} hotspotInfo={hotspot} />
      ))}
      {hotspotModels.map((hotspot, index) => (
        <GroundHotspotModel key={index} hotspotModel={hotspot} />
      ))}
      {hotspotMedias.map((hotspot, index) => (
        <VideoMeshComponent key={index} hotspotMedia={hotspot} />
      ))}
    </Canvas>
  );
});

export default TourCanvas;
