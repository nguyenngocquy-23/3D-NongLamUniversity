import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
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
import gsap from "gsap";
import { Environment } from "@react-three/drei";
import { DEFAULT_ORIGINAL_Z } from "../../utils/Constants";
import { getAngleFromXZ } from "../../utils/MathUtils";
import Radar from "./Radar";
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
  }) => {
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const cameraRadarRef = useRef<number>(0);
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
        const preloadHotspots = preloadNodesRedux.flatMap(
          (node) => node.navHotspots || []
        );

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

    const prevPanoramaIdRef = useRef<string | null>(null);

    useEffect(() => {
      if (!defaultNode) return;

      const defaultYaw = getAngleFromXZ(
        defaultNode.positionX / DEFAULT_ORIGINAL_Z,
        defaultNode.positionZ / DEFAULT_ORIGINAL_Z
      );

      if (
        prevPanoramaIdRef.current &&
        defaultNode.id !== prevPanoramaIdRef.current
      ) {
        // Nếu không phải node gốc → cộng thêm delta xoay
        cameraRadarRef.current = (cameraRadarRef.current + cameraAngle) % 360;
      }

      if (defaultNode.status === 2) {
        cameraRadarRef.current = defaultYaw;
      }

      prevPanoramaIdRef.current = defaultNode.id;
    }, [defaultNode?.id]);

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
      const control = controlsRef.current;

      const originalFov = camera.fov;
      console.log(`Vij trí camera fov: ${originalFov}`);
      const zoomTarget = 45; // Hiệu ứng zoom in đến vị trí mong muốn.
      const targetPano = preloadNodesRedux.find(
        (pano) => pano.id === targetNodeId
      );

      const [x, y, z] = hotspotTargetPosition;

      // === Bước 1:Xoay camera về vị trí (hotspot)
      lookAtHotspot([x, y, z]);

      // === Bước 2: Zoom vào
      console.log(
        `[CreateTourStep2] Bắt đầu việc gọi vào handleSelectNode: ${
          performance.now() / 1000
        } giây`
      );
      handleSelectNode(Number(targetNodeId));

      console.log(
        `[CreateTourStep2] Bắt đầu việc gọi vào zoom: ${
          performance.now() / 1000
        } giây`
      );
      gsap.to(camera, {
        fov: zoomTarget,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
        onComplete: () => {
          console.log(
            `[CreateTourStep2] Kết thúc việc zoom vào: ${
              performance.now() / 1000
            } giây`
          );
          const [px, py, pz] = [
            targetPano?.positionX,
            targetPano?.positionY,
            targetPano?.positionZ,
          ];
          if (
            typeof px === "number" &&
            typeof py === "number" &&
            typeof pz === "number"
          ) {
            camera.position.set(px, py, pz);
          }
          console.log(
            `[CreateTourStep2] Bắt đầu set camera: ${
              performance.now() / 1000
            } giây`
          );

          gsap.to(camera, {
            fov: originalFov,
            duration: 0.3,
            delay: 0.3,
            ease: "power2.inOut",
            onUpdate: () => {
              camera.updateProjectionMatrix();
            },
            onComplete: () => {
              camera.updateProjectionMatrix();
              control.update(); // đảm bảo OrbitControls cập nhật
            },
          });
        },
      });
    };

    const lookAtHotspot = (hotspotTargetPosition: [number, number, number]) => {
      if (!cameraRef.current || !controlsRef.current) return;

      const controls = controlsRef.current;

      /**
       * Toạ độ hoá vector (Dùng cho việc chỉ hướng) cho 2 điểm hotspot target và center
       * + Lưu ý: hotspot target sẽ nằm dưới mặt đất -> ta cần lấy ngang tầm mắt tức là y =0.
       */
      const hotspotVec = new THREE.Vector3(
        hotspotTargetPosition[0],
        0,
        hotspotTargetPosition[2]
      );
      const center = new THREE.Vector3(0, 0, 0);

      const dir = hotspotVec.clone().sub(center); // Vector hướng từ tâm -> hotspot

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(dir);

      // PHI : Góc xoay theo mặt phẳng XZ / THETA: Góc xoay theo trục Y
      controls.setAzimuthalAngle(spherical.theta + Math.PI); // quay 180 độ
      controls.setPolarAngle(Math.PI - spherical.phi); // góc xoay dọc

      controls.update();
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
        <UpdateCameraOnResize />
        <TourScene
          radius={radius}
          sphereRef={sphereRef}
          textureCurrent={defaultNode.url ?? "/khoa.jpg"}
          lightIntensity={defaultNode.lightIntensity}
          onTextureReady={() => setIsTextureReady(true)}
        />
        {isOpenRadar && defaultNode && (
          <Radar
            currentPanorama={defaultNode}
            angleCurrent={(cameraRadarRef.current + cameraAngle) % 360}
            panoramaList={preloadNodesRef.current}
            navigateList={preloadNavigatesRef.current}
            setIsOpenRadar={setIsOpenRadar}
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
          cameraRadarRef={cameraRadarRef}
          currentPano={defaultNode}
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
