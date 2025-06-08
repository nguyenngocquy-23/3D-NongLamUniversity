import { useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import OptionHotspot from "./taskCreateTourList/OptionHotspot";
import { HotspotMedia } from "../../redux/slices/HotspotSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";

interface VideoMeshProps {
  hotspotMedia: HotspotMedia;
  setCurrentHotspotId?: (val: string | null) => void;
}
const VideoMeshComponent = ({
  hotspotMedia,
  setCurrentHotspotId,
}: VideoMeshProps) => {
  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);
  const [texture, setTexture] = useState<THREE.VideoTexture | THREE.Texture | null>(null);
  const [cornerPointes, setCornerPointes] = useState(
    JSON.parse(hotspotMedia.cornerPointList) as [number, number, number][]
  );
  const [isPaused, setIsPaused] = useState(false);
  const currentStep = useSelector((state: RootState) => state.step.currentStep);

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
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  };

  useEffect(() => {
    if (
      cornerPointes.length === 4 &&
      hotspotMedia.mediaUrl &&
      hotspotMedia.mediaType === "VIDEO"
    ) {
      const video = document.createElement("video");
      video.src = hotspotMedia.mediaUrl;
      video.crossOrigin = "anonymous";
      video.muted = false;
      video.playsInline = true;
      video.loop = true;
      video.autoplay = true;
      video.style.display = "none";
      video.style.pointerEvents = "none";
      document.body.appendChild(video);

      const handleCanPlay = () => {
        const tex = new THREE.VideoTexture(video);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.colorSpace = "srgb";
        tex.image.width = video.videoWidth;
        tex.image.height = video.videoHeight;
        tex.needsUpdate = true;

        setTexture(tex);

        if (!isPaused) {
          video.play().catch((err) => console.warn("Video play error:", err));
        } else {
          video.pause();
        }
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
      };
    } else {
      const image = new Image();
      image.crossOrigin = "anonymous";
      let isCancelled = false;

      const onLoad = () => {
        if (isCancelled) return;
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          console.warn("Image failed to load");
          return;
        }
        const tex = new THREE.Texture(image);
        tex.colorSpace = "srgb";
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;

        setTexture(tex);
      };

      image.addEventListener("load", onLoad);
      image.src = hotspotMedia.mediaUrl;

      return () => {
        isCancelled = true;
        image.removeEventListener("load", onLoad);
        texture?.dispose();
        setTexture(null);
      };
    }
  }, [hotspotMedia, cornerPointes, isPaused]);

  if (cornerPointes.length !== 4) return null;

  // Tạo geometry và material bằng useMemo để tránh tạo lại quá nhiều lần
  const geometry = useMemo(() => createCustomGeometry(cornerPointes), [cornerPointes]);
  const center = useMemo(() => getCenterOfPoints(cornerPointes), [cornerPointes]);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture || null,
      color: texture ? 0xffffff : 0x888888,
      side: THREE.DoubleSide,
      transparent: false,
    });
  }, [texture]);

  // Giải phóng memory cho material và geometry khi component unmount hoặc thay đổi
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <>
      <mesh
        geometry={geometry}
        material={material}
        position={center}
        castShadow
        receiveShadow
        visible={true}
        onPointerDown={(e) => {
          if (e.button !== 2) {
            setIsPaused((prev) => !prev);
          }
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.nativeEvent.preventDefault();
          setIsOpenHotspotOption(true);
        }}
      />
      {isOpenHotspotOption && currentStep !== 3  && currentStep != 1 && (
        <OptionHotspot
          hotspotId={hotspotMedia.id}
          setCurrentHotspotId={setCurrentHotspotId ?? (() => {})}
          onClose={() => setIsOpenHotspotOption(false)}
          position={[hotspotMedia.positionX, hotspotMedia.positionY, hotspotMedia.positionZ]}
        />
      )}
    </>
  );
};

export default VideoMeshComponent;
