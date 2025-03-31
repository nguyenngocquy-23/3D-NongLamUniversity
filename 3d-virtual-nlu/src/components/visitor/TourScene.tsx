import { useThree } from "@react-three/fiber";
import React, { useCallback, useEffect, useState } from "react";
import * as THREE from "three";

/**
 *  Lớp này sử dụng cho việc :
 * + Xử lý camera
 * + Xử lý ánh sáng, texture ~ liên quan đến ảnh panorama
 * + Tập trung cho việc hiển thị.
 */

interface TourSceneProps {
  radius: number;
  sphereRef: React.RefObject<THREE.Mesh | null>;
}

const TourScene: React.FC<TourSceneProps> = ({ radius, sphereRef }) => {
  const { scene } = useThree();

  useEffect(() => {
    const geometry = new THREE.SphereGeometry(radius, 128, 128);

    const texture = new THREE.TextureLoader().load("khoa.jpg");
    const texture2 = new THREE.TextureLoader().load("thuvien.jpg"); //test

    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    //test

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = "virtual-sphere";

    if (sphereRef) {
      sphereRef.current = sphere;
      console.log(
        "sphereRef.current được gán trong TourScene nè",
        sphereRef.current
      );
    }

    const axesHelper = new THREE.AxesHelper(100);

    scene.add(sphere);
    scene.add(axesHelper);

    /**
     * Xử lý hậu kỳ ánh sáng cho scene.
     */

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    return () => {
      scene.remove(sphere);
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [radius, scene, sphereRef]);

  // const switchTexture = useCallback(() => {
  // if (sphereRef.current) {
  //   const material = sphereRef.current.material as THREE.MeshBasicMaterial;
  //   const newTexture = material.map?.image.src.includes("khoa.jpg")
  //     ? new THREE.TextureLoader().load("thuvien.jpg")
  //     : new THREE.TextureLoader().load("khoa.jpg");
  //   newTexture.wrapS = THREE.RepeatWrapping;
  //   newTexture.repeat.x = -1;

  //   material.map = newTexture;
  //   material.needsUpdate = true;
  //   console.log("Đã chuyển đổi texture!");
  // }
  // }, [sphereRef]);

  return null;
};

export default TourScene;
