import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

/**
 *  Lớp này sử dụng cho việc :
 * + Xử lý camera
 * + Xử lý ánh sáng, texture ~ liên quan đến ảnh panorama
 * + Tập trung cho việc hiển thị.
 */

type TourSceneProps = {
  radius: number;
};

const TourScene: React.FC<TourSceneProps> = ({ radius }) => {
  const { scene } = useThree();

  useEffect(() => {
    const geometry = new THREE.SphereGeometry(radius, 128, 128);

    const texture = new THREE.TextureLoader().load("khoa.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });
    const sphere = new THREE.Mesh(geometry, material);

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
  }, [radius, scene]);

  return null;
};

export default TourScene;
