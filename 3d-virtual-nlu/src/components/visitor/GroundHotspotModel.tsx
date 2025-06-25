import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/cardModel.module.css";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import OptionHotspot from "../admin/taskCreateTourList/OptionHotspot";
import { HotspotModel } from "../../redux/slices/HotspotSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { DoubleSide } from "three";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { RADIUS_SPHERE } from "../../utils/Constants";
type GroundHotspotProps = {
  setCurrentHotspotId?: (val: string | null) => void;
  setHoveredHotspot?: (hotspot: THREE.Mesh | null) => void;
  hotspotModel: HotspotModel;
  blockUpdate?: boolean;
};

const Node = ({ modelUrl }: { modelUrl: string }) => {
  const { scene } = useGLTF(modelUrl); // tải scene từ modelUrl

  return <primitive object={scene} />;
};

const GroundHotspotModel = ({
  setCurrentHotspotId,
  hotspotModel,
  blockUpdate,
}: GroundHotspotProps) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const icons = useSelector((state: RootState) => state.data.icons);
  const icon = icons.find((i) => i.id == hotspotModel.iconId);

  // Kiểm tra trạng thái chuột với model.
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setClicked] = useState(false);
  const { gl } = useThree();
  const navigate = useNavigate();
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);

  const targetOpacity = useRef(hotspotModel.opacity);
  const targetScale = useRef(hotspotModel.scale);
  const isIcon3D = icon.type === 2;
  const maxSizeRef = useRef(10 * hotspotModel.scale); // ĐANG SỬ DỤNG GIÁ TRỊ CỐ ĐỊNH CHO 3D HOTSPOT
  const groupRef = useRef<THREE.Group>(null);

  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  // Xoay model liên tục mỗi frame
  useFrame(() => {
    if (loadedModel) {
      loadedModel.rotation.y += 0.01;
    }
  });

  const [loadedModel, setLoadedModel] = useState<THREE.Group | null>(null);

  const userJson = sessionStorage.getItem("user");
  const user = JSON.parse(userJson || "{}");

  useEffect(() => {
    if (!hotspotModel.modelUrl) return;
    const loader = new GLTFLoader();
    loader.load(
      hotspotModel.modelUrl,
      (gltf) => {
        const scene = gltf.scene.clone();
        scene.scale.set(2, 2, 2);
        setLoadedModel(scene);
        console.log("✅ GLTF loaded:", gltf);
      },
      undefined,
      (error) => {
        console.error("❌ Lỗi load GLB:", error);
      }
    );
  }, [hotspotModel]);

  useEffect(() => {
    if (isHovered || isClicked) {
      targetOpacity.current = hotspotModel.opacity + 0.5;
      targetScale.current = hotspotModel.scale + 0.5;
    } else {
      targetOpacity.current = hotspotModel.opacity;
      targetScale.current = hotspotModel.scale;
    }
  }, [isHovered, hotspotModel]);

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
  }, [icon.url, hotspotModel]); // thêm color khi update

  const htmlGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (htmlGroupRef.current) {
      const obj = htmlGroupRef.current;
      obj.lookAt(camera.position);
      obj.rotateY(Math.PI);
    }
  });

  const scaleRef = useRef(1);
  useFrame((_, delta) => {
    if (!hotspotRef.current || isHovered) return;

    // Tăng scale đều
    scaleRef.current += delta * 1;
    if (scaleRef.current > 2) {
      scaleRef.current = 1; // Reset sau khi lan rộng
    }

    const s = scaleRef.current;
    hotspotRef.current.scale.set(s, s, s);

    // Làm mờ dần khi lan rộng
    const opacity = 1 - (s - 1) / 2;
    (hotspotRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

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

  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = new THREE.Vector3();
      box.getSize(size);
    }
  }, [clonedScene]);

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
            hotspotModel.positionX,
            hotspotModel.positionY + 15,
            hotspotModel.positionZ,
          ]}
        >
          <Suspense fallback={null}>
            {loadedModel && (
              <primitive position={[9, 0, -20]} object={loadedModel}>
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
              </primitive>
            )}
          </Suspense>
          <Html distanceFactor={40} transform>
            <div className={styles.container}>
              <div className={styles.leftPane} />
              <div className={styles.rightPane}>
                <div className={styles.title}>{hotspotModel.name}</div>
                <div className={styles.description}>
                  {hotspotModel.description}
                </div>
                <button
                  className={styles.button_detail}
                  onClick={() => {
                    user && user.role == 2
                      ? navigate("/admin/model", {
                          state: {
                            title: hotspotModel.name,
                            description: hotspotModel.description,
                            modelUrl: hotspotModel.modelUrl,
                          },
                        })
                      : navigate("/model", {
                          state: {
                            title: hotspotModel.name,
                            description: hotspotModel.description,
                            modelUrl: hotspotModel.modelUrl,
                          },
                        });
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </Html>
        </group>
      ) : (
        ""
      )}
      {isIcon3D && clonedScene ? (
        <group
          ref={groupRef}
          scale={hotspotModel.scale}
          position={[
            hotspotModel.positionX * scaleFactor,
            hotspotModel.positionY * scaleFactor,
            hotspotModel.positionZ * scaleFactor,
          ]}
          rotation={[
            THREE.MathUtils.degToRad(hotspotModel.pitchX),
            THREE.MathUtils.degToRad(hotspotModel.yawY),
            THREE.MathUtils.degToRad(hotspotModel.rollZ),
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
          onClick={() => {
            setClicked((preState) => !preState);
          }}
        >
          <primitive object={clonedScene} />
          <ambientLight color={"#fff"} intensity={0.3} />
        </group>
      ) : (
        <mesh
          ref={hotspotRef}
          position={[
            hotspotModel.positionX,
            hotspotModel.positionY,
            hotspotModel.positionZ,
          ]}
          rotation={[
            THREE.MathUtils.degToRad(hotspotModel.pitchX),
            THREE.MathUtils.degToRad(hotspotModel.yawY),
            THREE.MathUtils.degToRad(hotspotModel.rollZ),
          ]}
          onPointerOver={() => {
            setIsHovered(true);
            gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
          }}
          onPointerOut={() => {
            setIsHovered(false);
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
            // opacity={targetOpacity.current}
            opacity={hotspotModel.opacity}
            depthTest={false}
            color={new THREE.Color(hotspotModel.color)}
            side={DoubleSide}
          />
        </mesh>
      )}
      {isOpenHotspotOption && currentStep == 2 && !blockUpdate ? (
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
