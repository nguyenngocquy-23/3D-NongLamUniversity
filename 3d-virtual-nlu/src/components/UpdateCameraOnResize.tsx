/**
 *
 * Dành cho việc resize camera và canvas.
 */

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

const UpdateCameraOnResize = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const handleResize = () => {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      perspectiveCamera.updateProjectionMatrix();
      gl.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [camera, gl]);
  return null;
};
export default UpdateCameraOnResize;
