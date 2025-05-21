import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/cardModel.module.css";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { BaseHotspot, HotspotModel } from "../../redux/slices/HotspotSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { DoubleSide } from "three";
import { Html } from "@react-three/drei";
type GroundHotspotProps = {
  setCurrentHotspotId?: (val: string | null) => void;
  setHoveredHotspot?: (hotspot: THREE.Mesh | null) => void;
  hotspotModel: HotspotModel;
};

const GroundHotspotModel = ({
  setCurrentHotspotId,
  setHoveredHotspot,
  hotspotModel,
}: GroundHotspotProps) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const icons = useSelector((state: RootState) => state.data.icons);
  const iconUrl = icons.find((i) => i.id == hotspotModel.iconId).url;
  const modelRef = useRef<THREE.Group>(null); //gọi lại group trong return.
  /**
   * Đang set tạm
   */
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);

  // Kiểm tra trạng thái chuột với model.
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setClicked] = useState(false);
  const { gl } = useThree();
  const navigate = useNavigate();
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);
  const [modelUrl, setModelUrl] = useState(hotspotModel.modelUrl ?? "");

  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  // Xoay model liên tục mỗi frame
  // useFrame(() => {
  //   if (modelRef.current) {
  //     modelRef.current.rotation.y += 0.01; // Tốc độ xoay
  //   }
  // });
  const [loadedModel, setLoadedModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!modelUrl) return;
    const loader = new GLTFLoader();
    loader.load(
      hotspotModel.modelUrl,
      (gltf) => {
        const scene = gltf.scene;
        scene.scale.set(1.5, 1.5, 1.5);
        setLoadedModel(scene);
      },
      undefined,
      (error) => {
        console.error("❌ Lỗi load GLB:", error);
      }
    );
  }, [modelUrl, hotspotModel]);

  useEffect(() => {
    if (isHovered || isClicked) {
      targetOpacity.current = 1;
      targetScale.current = 2;
    } else {
      targetOpacity.current = 0.6;
      targetScale.current = 1.5;
    }
  }, [isHovered]);

  useFrame(() => {
    if (hotspotRef.current) {
      const material = hotspotRef.current
        .material as THREE.MeshStandardMaterial;
      material.opacity += (targetOpacity.current - material.opacity) * 0.1;
      hotspotRef.current.scale.lerp(
        new THREE.Vector3(targetScale.current, targetScale.current, 1),
        0.1
      );
    }
  });

  useEffect(() => {
    const loadAndModifySVG = async () => {
      try {
        const res = await fetch(iconUrl);
        let svgText = await res.text();

        // Thay fill nếu không có hoặc cập nhật fill hiện tại
        const hasFill =
          svgText.includes('fill="') || svgText.includes("fill='");

        if (!hasFill) {
          svgText = svgText.replace(
            "<svg",
            `<svg fill="${hotspotModel.color}"`
          );
        } else {
          svgText = svgText.replace(
            /fill="[^"]*"|fill='[^']*'/g,
            `fill="${hotspotModel.color}"`
          );
        }

        // Tạo Blob từ SVG text
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          const tex = new THREE.Texture(img);
          tex.needsUpdate = true;
          setTexture(tex);
          URL.revokeObjectURL(url); // Giải phóng bộ nhớ
        };
        img.src = url;
      } catch (err) {
        console.error("Error loading or processing SVG:", err);
      }
    };

    loadAndModifySVG();
  }, [iconUrl, hotspotModel]); // thêm color khi update

  return (
    <>
      {isClicked ? (
        <Html
          position={[
            hotspotModel.positionX,
            hotspotModel.positionY + 16,
            hotspotModel.positionZ,
          ]}
          distanceFactor={40}
          transform
        >
          <div className={styles.container}>
            {/* Mô hình trong canvas phụ (dùng portal) */}
            <div className={styles.leftPane}>
              <Suspense fallback={null}>
                {loadedModel && <primitive object={loadedModel} />}
              </Suspense>
            </div>

            {/* Nội dung bên phải */}
            <div className={styles.rightPane}>
              <div className={styles.title}>{hotspotModel.name}</div>
              <div className={styles.description}>
                {hotspotModel.description}
              </div>
              <button onClick={() => navigate("/admin/model")}>
                Xem chi tiết
              </button>
            </div>
          </div>
        </Html>
      ) : (
        ""
      )}
      <mesh
        ref={hotspotRef}
        position={[
          hotspotModel.positionX,
          hotspotModel.positionY,
          hotspotModel.positionZ,
        ]}
        rotation={[hotspotModel.pitchX, hotspotModel.yawY, hotspotModel.rollZ]}
        onPointerOver={() => {
          setIsHovered(true);
          // setHoveredHotspot(hotspotRef.current); //test
          gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
        }}
        onPointerOut={() => {
          setIsHovered(false);
          // setHoveredHotspot(null); //test
          gl.domElement.style.cursor = "default"; // 👈 đổi cursor
        }}
        onClick={() => {
          setClicked((preState) => !preState);
        }}
        onContextMenu={(e) => {
          e.nativeEvent.preventDefault(); // 👈 bắt buộc
          setIsOpenHotspotOption(true);
        }}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.6}
          depthTest={false}
          color={new THREE.Color(hotspotModel.color)}
          side={DoubleSide}
        />
      </mesh>
      {isOpenHotspotOption && currentStep != 3 ? (
        <OptionHotspot
          hotspotId={hotspotModel.id}
          setCurrentHotspotId={setCurrentHotspotId ?? (() => {})}
          onClose={() => {
            setIsOpenHotspotOption(false);
          }}
          position={[
            hotspotModel.positionX,
            hotspotModel.positionY,
            hotspotModel.positionZ,
          ]}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default GroundHotspotModel;
