import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/cardModel.module.css";
import * as THREE from "three";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { HotspotInformation } from "../../redux/slices/HotspotSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { DoubleSide } from "three";
import { Html, Text, useGLTF } from "@react-three/drei";
import { RADIUS_SPHERE } from "../../utils/Constants";
import FallbackHotspot from "../FallbackHotspot";
import { useModelCache } from "../../contexts/ImageCacheContext";
import Hotspot3D from "./Hotspot3D";
import {
  initialRgba,
  rgbaToString,
  stringToRgba,
} from "../../utils/TransformRgbaColor";
import { MdTransitEnterexit } from "react-icons/md";
type GroundHotspotProps = {
  setCurrentHotspotId?: (val: string | null) => void;
  hotspotInfo: HotspotInformation;
  blockUpdate?: boolean;
};

const GroundHotspotInfo = ({
  setCurrentHotspotId,
  hotspotInfo,
  blockUpdate,
}: GroundHotspotProps) => {
  /**
   * Sử dụng để Cache trên Virtual Tour.
   */
  const modelCache = useModelCache();

  const hotspotRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const icons = useSelector((state: RootState) => state.data.icons);

  const iconObj = icons.find((i) => i.id == hotspotInfo.iconId);
  const iconUrl = iconObj ? iconObj.url : "";

  const currentStep = useSelector((state: RootState) => state.step.currentStep);

  const targetOpacity = useRef(hotspotInfo.opacity);
  const targetScale = useRef(hotspotInfo.scale);

  // Kiểm tra trạng thái chuột với model.
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setClicked] = useState(false);
  const { gl } = useThree();
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);

  const isIcon3D = iconObj.type === 2;

  const maxSizeRef = useRef(10 * hotspotInfo.scale);

  useEffect(() => {
    if (isHovered || isClicked) {
      targetOpacity.current = hotspotInfo.opacity + 0.5;
      targetScale.current = hotspotInfo.scale + 0.5;
    } else {
      targetOpacity.current = hotspotInfo.opacity;
      targetScale.current = hotspotInfo.scale;
    }
  }, [isHovered, hotspotInfo]);

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
    if (iconObj.type !== 1) return;
    const loadAndModifySVG = async () => {
      try {
        const res = await fetch(iconUrl);
        let svgText = await res.text();

        // Thay fill nếu không có hoặc cập nhật fill hiện tại
        const hasFill =
          svgText.includes('fill="') || svgText.includes("fill='");

        if (!hasFill) {
          svgText = svgText.replace("<svg", `<svg fill="${hotspotInfo.color}"`);
        } else {
          svgText = svgText.replace(
            /fill="[^"]*"|fill='[^']*'/g,
            `fill="${hotspotInfo.color}"`
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
  }, [iconUrl, hotspotInfo]); // thêm color khi update

  const htmlGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (htmlGroupRef.current) {
      const obj = htmlGroupRef.current;
      obj.lookAt(camera.position);
      obj.rotateY(Math.PI);
    }
  });

  // animation
  useFrame((state) => {
    if (!hotspotRef.current || isHovered) return;

    const time = state.clock.getElapsedTime();

    // Lấy scale gốc hiện tại tại thời điểm render (scale.x đủ vì scale đồng đều)
    const baseScale =
      hotspotRef.current.userData.baseScale ?? hotspotRef.current.scale.x;

    // Biên độ dao động (mặc định = 0.2)
    const amplitude = hotspotRef.current.userData.amplitude ?? 0.2;

    // Tạo scale dao động quanh baseScale
    const s = baseScale + (amplitude * (Math.sin(time * 2) + 1)) / 2;
    hotspotRef.current.scale.set(s, s, s);

    // Opacity giảm khi scale tăng
    const opacityRange = hotspotRef.current.userData.opacityRange || [0.3, 1];
    const deviation = Math.abs(s - baseScale); // lệch từ baseScale
    const t = deviation / amplitude; // tỷ lệ lệch (0 → 1)
    const opacity = opacityRange[1] - t * (opacityRange[1] - opacityRange[0]);

    (hotspotRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

  /**
   * Nếu icon3D = glb => Nó là mô hình GlB
   * => Tải chưa xong thì dùng fallbackGlTf.
   */
  const gltf = isIcon3D ? useGLTF(iconObj.url, true) : null;
  const fallbackGltf = useGLTF(`${import.meta.env.BASE_URL}gheda.glb`, true);

  const clonedScene = useMemo(() => {
    //Nếu chưa có gltf nó sẽ return null.
    if (!isIcon3D) return null;

    const cache = modelCache.current[iconObj.url];

    const originalScene =
      cache?.glbScene ??
      (gltf && "scene" in gltf ? gltf.scene : null) ??
      fallbackGltf?.scene;

    console.log("[Giá trị display lúc đầu]", originalScene);

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
  }, [isIcon3D, gltf, fallbackGltf, modelCache]);

  useFrame(() => {
    if (clonedScene) {
      clonedScene.rotation.y += 0.01;
    }
  });

  // useEffect(() => {
  //   if (isHovered) {
  //     targetOpacity.current += 0.5;
  //   }
  // }, [isHovered]);

  /**
   * ICON 3D
   */

  const scaleFactor = (RADIUS_SPHERE - maxSizeRef.current) / 100;

  return (
    <>
      {isClicked ? (
        <group
          ref={htmlGroupRef}
          position={[
            hotspotInfo.positionX,
            hotspotInfo.positionY + 15,
            hotspotInfo.positionZ,
          ]}
        >
          <Html distanceFactor={40} transform>
            <div
              className={styles.container}
              style={{
                border:
                  Number(hotspotInfo.borderSizeContent) > 0.2
                    ? `${hotspotInfo.borderSizeContent}px solid ${hotspotInfo.borderColorContent}`
                    : undefined,
              }}
            >
              <div
                className={styles.center_pane}
                style={{
                  backgroundColor:
                    typeof hotspotInfo.backgroundColorContent === "string"
                      ? hotspotInfo.backgroundColorContent
                      : rgbaToString(
                          hotspotInfo.backgroundColorContent ?? initialRgba
                        ),
                }}
              >
                {hotspotInfo.content.trim() == "" ? (
                  <div className={styles.description}></div>
                ) : (
                  <>
                    <div
                      className={styles.description}
                      dangerouslySetInnerHTML={{ __html: hotspotInfo.content }}
                    />
                  </>
                )}
              </div>
              <span
                className={styles.exit_btn}
                onClick={() => {
                  setClicked((prev) => !prev);
                  console.log("Clicked exit button", isClicked);
                }}
              >
                <MdTransitEnterexit />
              </span>
            </div>
          </Html>
        </group>
      ) : (
        ""
      )}

      {isIcon3D && clonedScene ? (
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
          <primitive object={clonedScene} />

          <ambientLight color={"#fff"} intensity={0.3} />
        </group>
      ) : (
        <mesh
          ref={hotspotRef}
          position={[
            hotspotInfo.positionX,
            hotspotInfo.positionY,
            hotspotInfo.positionZ,
          ]}
          rotation={[
            THREE.MathUtils.degToRad(hotspotInfo.pitchX),
            THREE.MathUtils.degToRad(hotspotInfo.yawY),
            THREE.MathUtils.degToRad(hotspotInfo.rollZ),
          ]}
          onPointerOver={() => {
            setIsHovered(true);
            gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
          }}
          onPointerOut={() => {
            setIsHovered(false);
            gl.domElement.style.cursor = "default";
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
            opacity={hotspotInfo.opacity}
            depthTest={false}
            color={new THREE.Color(hotspotInfo.color)}
            side={DoubleSide}
          />
        </mesh>
      )}

      {isOpenHotspotOption &&
      (currentStep === 2 || currentStep === 4) &&
      !blockUpdate ? (
        <OptionHotspot
          hotspotId={hotspotInfo.id}
          setCurrentHotspotId={setCurrentHotspotId ?? (() => {})}
          onClose={() => {
            setIsOpenHotspotOption(false);
          }}
          position={[
            hotspotInfo.positionX,
            hotspotInfo.positionY,
            hotspotInfo.positionZ,
          ]}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default GroundHotspotInfo;
