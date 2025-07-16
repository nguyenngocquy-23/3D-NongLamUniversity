import { Html, PositionalAudio, useGLTF } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three";
import { RootState } from "../../redux/Store";
import { HotspotNavigation } from "../../redux/slices/HotspotSlice";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { RADIUS_SPHERE } from "../../utils/Constants";
import SoundEffect from "../admin/taskCreateTourList/SoundEffect";

type GroundHotspotProps = {
  onNavigate: (
    targetNodeId: string,
    cameraTargetPosition: [number, number, number]
  ) => void;
  hotspotNavigation: HotspotNavigation;
  setCurrentHotspotId?: (val: string | null) => void;
  blockUpdate?: boolean;
};

const GroundHotspot: React.FC<GroundHotspotProps> = ({
  onNavigate,
  hotspotNavigation,
  setCurrentHotspotId,
  blockUpdate,
}) => {
  const { gl } = useThree();
  //USEREF
  const hotspotRef = useRef<THREE.Mesh>(null);
  const maxSizeRef = useRef(10 * hotspotNavigation.scale); // ĐANG SỬ DỤNG GIÁ TRỊ CỐ ĐỊNH CHO 3D HOTSPOT
  const groupRef = useRef<THREE.Group>(null);
  const targetOpacity = useRef(hotspotNavigation.opacity);
  const targetScale = useRef(hotspotNavigation.scale);

  //REDUX
  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  const { icons } = useSelector((state: RootState) => state.data);
  const icon = icons.find((i) => i.id == hotspotNavigation.iconId);
  const panoramaList = useSelector(
    (state: RootState) => state.panoramas.panoramaList
  );
  const preloadNode = useSelector(
    (state: RootState) => state.data.preloadNodes
  );

  //STATE
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);
  const isIcon3D = icon.type === 2;
  const [playSound, setPlaySound] = useState<() => void>(() => () => {});

  /**
   * Đang thử nghiệm
   */
  // const [isClicked, setIsClicked] = useState(false);

  /**
   * ICON 2D
   */
  useEffect(() => {
    if (icon.type !== 1) return;
    const loadAndModifySVG = async () => {
      try {
        const res = await fetch(icon.url);
        let svgText = await res.text();

        // Thay fill nếu không có hoặc cập nhật fill hiện tại
        const hasFill =
          svgText.includes('fill="') || svgText.includes("fill='");

        if (!hasFill) {
          svgText = svgText.replace(
            "<svg",
            `<svg fill="${hotspotNavigation.color}"`
          );
        } else {
          svgText = svgText.replace(
            /fill="[^"]*"|fill='[^']*'/g,
            `fill="${hotspotNavigation.color}"`
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
  }, [icon.url, hotspotNavigation]);

  const gltf = isIcon3D ? useGLTF(icon.url) : null;

  const clonedScene = useMemo(() => {
    if (!isIcon3D || !gltf || Array.isArray(gltf) || !("scene" in gltf))
      return null;

    const scene = gltf.scene.clone(true);
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry = mesh.geometry.clone();

        if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            // Tắt ánh sáng từ môi trường (ambient light, point light...)
            // mesh.material.emissive.set("#347433"); // Chọn màu phát sáng cho hotspot
            mesh.material.emissiveIntensity = 10; // Độ sáng tự phát
            // mesh.material.color.set("#347433"); // Không có màu gốc (chỉ sáng bằng emissive)

            // Tắt phản chiếu ánh sáng từ môi trường (nếu có)
            mesh.material.envMap = null;
            mesh.material.envMapIntensity = 0;

            // Thêm nữa nếu muốn không chịu ảnh hưởng của ánh sáng khác
            mesh.material.metalness = 0; // Tắt metalness nếu không muốn phản chiếu ánh sáng
            mesh.material.roughness = 1; // Đảm bảo vật liệu không có độ nhám, tránh hiệu ứng sáng
          }
        }
      }
    });

    return scene;
  }, [isIcon3D, gltf]);

  useFrame(() => {
    if (clonedScene) {
      clonedScene.rotation.y += 0.01;
    }
  });

  useFrame(() => {
    if (hotspotRef.current) {
      const material = hotspotRef.current.material as THREE.MeshBasicMaterial;
      material.opacity += (targetOpacity.current - material.opacity) * 0.1;
      hotspotRef.current.scale.lerp(
        new THREE.Vector3(targetScale.current, targetScale.current, 1),
        0.1
      );
    }
  });

  useEffect(() => {
    if (isHovered) {
      targetOpacity.current = hotspotNavigation.opacity + 0.5;
      targetScale.current = hotspotNavigation.scale + 0.5;
    } else {
      targetOpacity.current = hotspotNavigation.opacity;
      targetScale.current = hotspotNavigation.scale;
    }
  }, [isHovered, hotspotNavigation]);

  useEffect(() => {
    if (isHovered) {
      targetOpacity.current += 0.5;
    }
  }, [isHovered]);
  const scaleFactor = (RADIUS_SPHERE - maxSizeRef.current) / 100;

  return (
    <>
      {isHovered && (
        <Html
          key="hover-hotspot"
          position={[
            hotspotNavigation.positionX,
            hotspotNavigation.positionY,
            hotspotNavigation.positionZ,
          ]}
        >
          <div
            style={{
              maxWidth: "200px",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding:
                panoramaList.find(
                  (pano) => pano.id == hotspotNavigation.targetNodeId
                )?.config.name.length > 0
                  ? "4px 8px"
                  : "",
              borderRadius: "4px",
              fontSize: "10px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {
              panoramaList.find(
                (pano) => pano.id == hotspotNavigation.targetNodeId
              )?.config.name
            }
          </div>
        </Html>
      )}
      {isIcon3D && clonedScene ? (
        <group
          key="3d-hotspot"
          ref={groupRef}
          scale={hotspotNavigation.scale}
          position={[
            hotspotNavigation.positionX * scaleFactor,
            hotspotNavigation.positionY * scaleFactor,
            hotspotNavigation.positionZ * scaleFactor,
          ]}
          rotation={[
            THREE.MathUtils.degToRad(hotspotNavigation.pitchX),
            THREE.MathUtils.degToRad(hotspotNavigation.yawY),
            THREE.MathUtils.degToRad(hotspotNavigation.rollZ),
          ]}
          onPointerOver={() => {
            setIsHovered(true);
            gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
          }}
          onPointerOut={() => {
            setIsHovered(false);
            gl.domElement.style.cursor = "default";
          }}
          onContextMenu={() => {
            setIsOpenHotspotOption((prev) => !prev);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (hotspotNavigation && hotspotNavigation.targetNodeId) {
              onNavigate(hotspotNavigation.targetNodeId, [
                hotspotNavigation.positionX,
                hotspotNavigation.positionY,
                hotspotNavigation.positionZ,
              ]);
            }
          }}
        >
          <primitive object={clonedScene}></primitive>

          <ambientLight color={"#fff"} intensity={0.3} />
        </group>
      ) : (
        <mesh
          key="2d-hotspot"
          ref={hotspotRef}
          position={[
            hotspotNavigation.positionX,
            hotspotNavigation.positionY,
            hotspotNavigation.positionZ,
          ]}
          rotation={[
            THREE.MathUtils.degToRad(hotspotNavigation.pitchX),
            THREE.MathUtils.degToRad(hotspotNavigation.yawY),
            THREE.MathUtils.degToRad(hotspotNavigation.rollZ),
          ]}
          scale={hotspotNavigation.scale}
          onPointerOver={() => {
            setIsHovered(true);
            gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
          }}
          onPointerOut={() => {
            setIsHovered(false);
            gl.domElement.style.cursor = "default";
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (hotspotNavigation && hotspotNavigation.targetNodeId) {
              onNavigate(hotspotNavigation.targetNodeId, [
                hotspotNavigation.positionX,
                hotspotNavigation.positionY,
                hotspotNavigation.positionZ,
              ]);
            }
          }}
          onContextMenu={() => {
            if (isHovered) {
              setIsOpenHotspotOption((prev) => !prev);
            }
          }}
        >
          <planeGeometry
            args={[5 * hotspotNavigation.scale, 5 * hotspotNavigation.scale]}
          />
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={hotspotNavigation.opacity}
            depthTest={false}
            color={new THREE.Color(hotspotNavigation.color)}
            emissive={new THREE.Color(hotspotNavigation.color)}
            emissiveIntensity={isHovered ? 2 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {isOpenHotspotOption &&
      (currentStep == 2 || currentStep == 4) &&
      !blockUpdate ? (
        <OptionHotspot
          key="config-hotspot"
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
      ) : null}
    </>
  );
};
export default GroundHotspot;
