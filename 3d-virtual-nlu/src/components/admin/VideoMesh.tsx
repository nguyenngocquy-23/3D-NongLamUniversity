import { useState, useRef, useEffect } from "react";
import * as THREE from 'three';

interface VideoMeshProps {
  cornerPoints: any[];
  currentVideoUrl: string;
}

const VideoMeshComponent = ({
  cornerPoints,
  currentVideoUrl,
}: VideoMeshProps) => {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  //tính trung điểm của 4 góc
  const getCenterOfPoints = (points: [number, number, number][]) => {
    const center = [0, 0, 0];
    for (let i = 0; i < 4; i++) {
      center[0] += points[i][0];
      center[1] += points[i][1];
      center[2] += points[i][2];
    }
    return center.map((v) => v / 4) as [number, number, number];
  };

  const createCustomGeometry = (points: [number, number, number][]) => {
    const geometry = new THREE.BufferGeometry();
    const center = getCenterOfPoints(points);

    const vertices = new Float32Array([
      points[0][0] - center[0],
      points[0][1] - center[1],
      points[0][2] - center[2],
      points[1][0] - center[0],
      points[1][1] - center[1],
      points[1][2] - center[2],
      points[2][0] - center[0],
      points[2][1] - center[1],
      points[2][2] - center[2],
      points[3][0] - center[0],
      points[3][1] - center[1],
      points[3][2] - center[2],
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    // gắn center lại để dùng bên ngoài nếu cần
    geometry.userData.center = center;

    return geometry;
  };
  const textureCreatedRef = useRef(false);

  useEffect(() => {
    if (cornerPoints.length === 4 && currentVideoUrl) {
      const video = document.createElement("video");
      video.src = currentVideoUrl;
      video.crossOrigin = "anonymous";
      video.muted = false;
      video.playsInline = true;
      video.loop = true;
      video.autoplay = true;
      video.style.display = "none";
      document.body.appendChild(video);

      const handleCanPlay = () => {
        if (textureCreatedRef.current) return;

        const tex = new THREE.VideoTexture(video);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.format = THREE.RGBFormat;
        tex.image.width = video.videoWidth;
        tex.image.height = video.videoHeight;
        tex.needsUpdate = true;

        setTexture(tex);
        textureCreatedRef.current = true;

        video.play().catch((err) => console.warn("Video play error:", err));
      };

      video.addEventListener("canplaythrough", handleCanPlay);
      video.load();

      return () => {
        video.removeEventListener("canplaythrough", handleCanPlay);
        video.pause();
        video.src = "";
        video.remove();
        texture?.dispose();
        setTexture(null);
        textureCreatedRef.current = false; // reset lại cho lần sau
      };
    }
  }, [currentVideoUrl, cornerPoints]);

  if (cornerPoints.length > 4) return null;

  const geometry = createCustomGeometry(cornerPoints);
  const center = geometry.userData.center;

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })
  );

  return <primitive object={mesh} position={center} />;
};

export default VideoMeshComponent;