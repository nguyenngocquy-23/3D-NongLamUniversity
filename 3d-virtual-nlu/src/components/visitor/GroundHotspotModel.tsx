import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
type GroundHotspotProps = {
  position: [number, number, number];
  setHoveredHotspot: (hotspot: THREE.Mesh | null) => void; //test.
};

const GroundHotspotModel = ({
  position,
  setHoveredHotspot,
}: GroundHotspotProps) => {
  const hotspotRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(
    () => new THREE.TextureLoader().load("/vite.svg"),
    []
  );
  // const texture = useTexture("/vite.svg");
  // const texture = useLoader(THREE.TextureLoader, "/vite.svg");

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setClicked] = useState(false);
  const targetOpacity = useRef(0.6);
  const targetScale = useRef(5);
  const modelRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const navigate = useNavigate();

  // Xoay model liên tục mỗi frame
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01; // Tốc độ xoay
    }
  });

  useEffect(() => {
    const loader = new GLTFLoader();
    console.error("Load GLB:");
    loader.load(
      "/public/gheda.glb",
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
  }, []);

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

  return (
    <>
      {/* <Suspense fallback={"loading.."}> */}
      <group
        ref={modelRef}
        position={[position[0], position[1] + 10, position[2]]}
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
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => {
          setIsHovered(true);
          console.log("🖱 Hover vào hotspot models!", position);
          setHoveredHotspot(hotspotRef.current); //test
          gl.domElement.style.cursor = "pointer"; // 👈 đổi cursor
        }}
        onPointerOut={() => {
          setIsHovered(false);
          console.log("Rời khỏi hotspot!");
          setHoveredHotspot(null); //test
          gl.domElement.style.cursor = "default"; // 👈 đổi cursor
        }}
        onClick={() => {
          setClicked((preState) => !preState);
        }}
      >
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.6}
          depthTest={false}
        />
      </mesh>
      {/* </Suspense> */}
    </>
  );
};

export default GroundHotspotModel;
