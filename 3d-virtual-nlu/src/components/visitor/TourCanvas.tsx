import { Canvas } from "@react-three/fiber";
import React, { Ref, Suspense, useEffect, useRef, useState } from "react";
import VideoMeshComponent from "../admin/VideoMesh";
import UpdateCameraOnResize from "../UpdateCameraOnResize";
import CamControls from "./CamControls";
import GroundHotspotInfo from "./GroundHotspotInfo";
import GroundHotspotModel from "./GroundHotspotModel";
import TourScene from "./TourScene";
import styles from "../../styles/virtualTour.module.css";
import GroundHotspot from "./GroundHotspot";
import * as THREE from "three";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { setDefaultNode } from "../../redux/slices/DataSlice";
import { Environment } from "@react-three/drei";
import { DEFAULT_ORIGINAL_Z } from "../../utils/Constants";
import Radar from "./Radar";
import { Perf } from "r3f-perf";
import { ImageCacheMap } from "../../contexts/ImageCacheContext";
const TourCanvas = React.memo(
  ({
    windowSize,
    sphereRef,
    radius,
    defaultNode,
    isRotation,
    targetPosition,
    hotspotNavigations,
    hotspotInformations,
    hotspotModels,
    hotspotMedias,
    setTargetPosition,
    isOpenRadar,
    setIsOpenRadar,
    imageRef,
    imageVersion,
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
    setTargetPosition: (position: [number, number, number]) => void;
    isOpenRadar: boolean;
    setIsOpenRadar: (val: boolean) => void;
    imageRef: React.RefObject<ImageCacheMap>;
    imageVersion: number;
  }) => {
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<any>(null); //OrbitControls
    const dispatch = useDispatch();

    const preloadNodesRedux = useSelector(
      (state: RootState) => state.data.preloadNodes
    );
    const preloadNodesRef = useRef<any[]>([]);
    const preloadNavigatesRef = useRef<any[]>([]);

    useEffect(() => {
      if (defaultNode.status === 2) {
        const defaultHotspots = defaultNode.navHotspots || [];
        const preloadHotspots = preloadNodesRedux
          .filter((node) => node.status != 2)
          .flatMap((node) => node.navHotspots || []);

        // Gộp và loại bỏ trùng dựa trên targetNodeId
        const merged = [...defaultHotspots, ...preloadHotspots];
        const uniqueHotspots = Array.from(
          new Map(
            merged
              .filter((h) => h.targetNodeId !== defaultNode.id) // <== loại trùng với node master
              .map((h) => [h.targetNodeId, h])
          ).values()
        );

        preloadNavigatesRef.current = uniqueHotspots;
        preloadNodesRef.current = [defaultNode, ...preloadNodesRedux];
      }
    }, [defaultNode, preloadNodesRedux, preloadNavigatesRef]);

    const [cameraAngle, setCameraAngle] = useState(0);
    const handleSelectNode = (id: number) => {
      setIsTextureReady(false);
      const activeNode = preloadNodesRedux.find((h) => h.id === id);
      dispatch(setDefaultNode(activeNode));
    };

    /**
     *
     * @param targetNodeId : Id node đích cần di chuyển.
     * @param hotspotTargetPosition : Thay thế vị trí camera hướng đến tại vị trí hotspot mục tiêu.
     */
    const handleHotspotNavigate = (
      targetNodeId: string,
      hotspotTargetPosition: [number, number, number]
    ) => {
      if (!cameraRef.current || !controlsRef.current) return;

      const camera = cameraRef.current;

      const [x, y, z] = hotspotTargetPosition;

      // === Bước 2: Zoom vào
      handleSelectNode(Number(targetNodeId));
    };

    const [isTextureReady, setIsTextureReady] = useState<boolean>(false);

    return (
      <Canvas
        camera={{
          fov: 75,
          aspect: windowSize.width / windowSize.height,
          near: 0.1,
          far: 1000,
          position: [0, 0, DEFAULT_ORIGINAL_Z],
        }}
        className={styles.tourCanvas}
      >
        <Environment preset="studio" background={false} />
        <Perf />
        <UpdateCameraOnResize />
        <TourScene
          radius={radius}
          sphereRef={sphereRef}
          imageRef={imageRef}
          nodeId={defaultNode.id}
          textureCurrent={defaultNode.url ?? "/khoa.jpg"}
          yawOffsetCurrent={defaultNode.yawOffset ?? 0}
          lightIntensity={defaultNode.lightIntensity}
          onTextureReady={() => setIsTextureReady(true)}
          imageVersion={imageVersion}
        />
        <Perf />
        {isOpenRadar && defaultNode && (
          <Radar
            currentPanorama={defaultNode}
            angleCurrent={cameraAngle}
            panoramaList={preloadNodesRef.current}
            navigateList={preloadNavigatesRef.current}
            setIsOpenRadar={setIsOpenRadar}
            imageRef={imageRef}
          />
        )}
        <CamControls
          controlsRef={controlsRef}
          targetPosition={targetPosition}
          cameraRef={cameraRef}
          sphereRef={sphereRef}
          autoRotate={isRotation}
          autoRotateSpeed={
            defaultNode || defaultNode.speedRotate == 0
              ? 0.2
              : defaultNode.speedRotate
          }
          onAngleChange={(angle) => {
            setCameraAngle(angle); // cameraAngle luôn là góc thật tại thời điểm hiện tại (0–360)
          }}
        />
        {isTextureReady &&
          hotspotInformations.map((hotspot) => (
            <GroundHotspotInfo
              key={hotspot.id}
              hotspotInfo={hotspot}
              blockUpdate={true}
            />
          ))}
        {isTextureReady &&
          hotspotNavigations.map((hotspot) => (
            <GroundHotspot
              key={hotspot.id}
              onNavigate={(targetNodeId, cameraTargetPosition) =>
                handleHotspotNavigate(targetNodeId, cameraTargetPosition)
              }
              hotspotNavigation={hotspot}
              blockUpdate={true}
            />
          ))}
        {isTextureReady &&
          hotspotModels.map((hotspot) => (
            <GroundHotspotModel
              key={hotspot.id}
              hotspotModel={hotspot}
              blockUpdate={true}
            />
          ))}
        {isTextureReady &&
          hotspotMedias.map((hotspot) => (
            <VideoMeshComponent
              key={hotspot.id}
              hotspotMedia={hotspot}
              blockUpdate={true}
            />
          ))}
      </Canvas>
    );
  }
);

export default TourCanvas;
