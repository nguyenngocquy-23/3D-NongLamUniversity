import { Canvas } from "@react-three/fiber";
import React, { useRef } from "react";
import VideoMeshComponent from "../admin/VideoMesh";
import UpdateCameraOnResize from "../UpdateCameraOnResize";
import CamControls from "./CamControls";
import GroundHotspotInfo from "./GroundHotspotInfo";
import GroundHotspotModel from "./GroundHotspotModel";
import TourScene from "./TourScene";
import styles from "../../styles/virtualTour.module.css";
import GroundHotspot from "./GroundHotspot";
import * as THREE from "three";
import { useDispatch } from "react-redux";
import { selectPanorama } from "../../redux/slices/PanoramaSlice";

const TourCanvas = React.memo(
  ({
    windowSize,
    cursor,
    sphereRef,
    radius,
    defaultNode,
    isRotation,
    targetPosition,
    hotspotNavigations,
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
    hotspotNavigations: any[];
    hotspotInformations: any[];
    hotspotModels: any[];
    hotspotMedias: any[];
  }) => {
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<any>(null); //OrbitControls
    const dispatch = useDispatch();
    const handleSelectNode = (id: string) => {
      dispatch(selectPanorama(id));
    };

    const handleHotspotNavigate = (
      targetNodeId: string,
      hotspotTargetPosition: [number, number, number]
    ) => {
      if (!cameraRef.current || !controlsRef.current) return;

      const camera = cameraRef.current;
      const control = controlsRef.current;
      const originalFov = camera.fov;
      const zoomTarget = 45; // Có thể điều chỉnh FOV này tùy theo yêu cầu

      const [x, y, z] = hotspotTargetPosition;

      // === Bước 1: Tạo điểm cần nhìn đến (hotspot)
      const targetLookAt = new THREE.Vector3(x, 0, z);

      // === Bước 2: Animation tạm thời "quay" camera bằng cách move lookAt
      const tempTarget = targetLookAt.clone();

      gsap.to(camera.rotation, {
        duration: 0.2,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(tempTarget);
          control.update();
        },
        onComplete: () => {
          gsap.to(camera, {
            fov: zoomTarget,
            duration: 1.0,
            ease: "power2.inOut",
            onUpdate: () => {
              handleSelectNode(targetNodeId);
              camera.updateProjectionMatrix();
            },
            onComplete: () => {
              camera.fov = originalFov;
              camera.lookAt(0, 0, 0); // về
              camera.updateProjectionMatrix();
              control.update();
            },
          });
        },
      });
    };
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
        {hotspotNavigations.map((hotspot, index) => (
          <GroundHotspot
            key={index}
            onNavigate={(targetNodeId, cameraTargetPosition) =>
              handleHotspotNavigate(targetNodeId, cameraTargetPosition)
            }
            hotspotNavigation={hotspot}
          />
        ))}
        {hotspotModels.map((hotspot, index) => (
          <GroundHotspotModel key={index} hotspotModel={hotspot} />
        ))}
        {hotspotMedias.map((hotspot, index) => (
          <VideoMeshComponent key={index} hotspotMedia={hotspot} />
        ))}
      </Canvas>
    );
  }
);

export default TourCanvas;
