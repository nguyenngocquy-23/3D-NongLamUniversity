import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { BaseHotspot, HotspotModel } from "../../redux/slices/HotspotSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { DoubleSide } from "three";
type GroundHotspotProps = {
  setCurrentHotspotId: (val: string | null) => void;
  setHoveredHotspot: (hotspot: THREE.Mesh | null) => void;
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
  const [modelUrl, setModelUrl] = useState("");

  // Xoay model liên tục mỗi frame
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01; // Tốc độ xoay
    }
  });

  useEffect(() => {
    if (!modelUrl) return;

    const loader = new GLTFLoader();
    console.error("Load GLB:");
    loader.load(
      modelUrl ?? "",
      (gltf) => {
        const scene = gltf.scene;
        if (modelRef.current) {
          modelRef.current.add(scene);
        }
      },
      undefined,
      (error) => {
        console.error("❌ Lỗi load GLB:", error);
      }
    );
  }, [modelUrl]);

  useEffect(() => {
    if (isHovered || isClicked) {
      targetOpacity.current = 1;
      targetScale.current = 3;
    } else {
      targetOpacity.current = 0.6;
      targetScale.current = 2;
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
      {/* <Suspense fallback={"loading.."}> */}
      <group
        ref={modelRef}
        position={[
          hotspotModel.positionX,
          hotspotModel.positionY + 10,
          hotspotModel.positionZ,
        ]}
        scale={2}
        visible={isClicked}
        onPointerOver={() => {
          gl.domElement.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          gl.domElement.style.cursor = "default";
        }}
        onClick={() => {
          navigate("/admin/model");
        }} // tách lớp gọi api lấy model
      >
        <ambientLight color={"#fff"} intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
      </group>
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
          setHoveredHotspot(hotspotRef.current); //test
          gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
        }}
        onPointerOut={() => {
          setIsHovered(false);
          setHoveredHotspot(null); //test
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
      {isOpenHotspotOption ? (
        <OptionHotspot
          hotspotId={hotspotModel.id}
          setCurrentHotspotId={setCurrentHotspotId}
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
