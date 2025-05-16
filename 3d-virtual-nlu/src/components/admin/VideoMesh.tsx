import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import OptionHotspot from "./taskCreateTourList/OptionHotspot";
import { HotspotMedia } from "../../redux/slices/HotspotSlice";

interface VideoMeshProps {
  hotspotMedia: HotspotMedia;
  setCurrentHotspotId: (val: string | null) => void;
}
const VideoMeshComponent = ({
  hotspotMedia,
  setCurrentHotspotId,
}: VideoMeshProps) => {
  console.log("VideoMeshComponent initialized");

  const [isOpenHotspotOption, setIsOpenHotspotOption] = useState(false);
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);

  console.log("cornerPointes initialized", hotspotMedia.cornerPointListJson);

  const getCenterOfPoints = (points: [number, number, number][]) => {
    console.log("getCenterOfPoints called");
    const center = [0, 0, 0];
    for (let i = 0; i < 4; i++) {
      center[0] += points[i][0];
      center[1] += points[i][1];
      center[2] += points[i][2];
    }
    return center.map((v) => v / 4) as [number, number, number];
  };

  const createCustomGeometry = (points: [number, number, number][]) => {
    console.log("createCustomGeometry called");
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

    geometry.userData.center = center;

    console.log("createCustomGeometry finished");
    return geometry;
  };

  const textureCreatedRef = useRef(false);
  const [cornerPointes, setCornerPointes] = useState(
    JSON.parse(hotspotMedia.cornerPointListJson) as [number, number, number][]
  );
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    console.log("useEffect called");
    console.log("again........", hotspotMedia.mediaUrl);
    console.log("length........", cornerPointes.length);
    if (cornerPointes.length === 4 && hotspotMedia.mediaUrl) {
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
        console.log("handleCanPlay called");
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

        if (!isPaused) {
          video.play().catch((err) => console.warn("Video play error:", err));
        } else {
          video.pause();
        }
      };

      video.addEventListener("canplaythrough", handleCanPlay);
      video.load();

      return () => {
        console.log("useEffect cleanup");
        video.removeEventListener("canplaythrough", handleCanPlay);
        video.pause();
        video.src = "";
        video.remove();
        texture?.dispose();
        setTexture(null);
        textureCreatedRef.current = false;
      };
    }
  }, [hotspotMedia, cornerPointes, isPaused]);

  if (cornerPointes.length > 4) return null;

  useEffect(() => {
    console.log("useEffect called");
    if (cornerPointes.length !== 4) return;

    const geometry = createCustomGeometry(cornerPointes);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const center = getCenterOfPoints(cornerPointes);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const newMesh = new THREE.Mesh(geometry, material);
    newMesh.position.set(...center);
    setMesh(newMesh);
  }, [cornerPointes, texture, hotspotMedia]);

  useEffect(() => {
    console.log("useEffect called");
    return () => {
      console.log("useEffect cleanup");
      mesh?.geometry.dispose();
      if (Array.isArray(mesh?.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh?.material.dispose();
      }
    };
  }, [mesh]);

  return (
    <>
      {mesh && (
        <primitive
          key={hotspotMedia.id}
          object={mesh}
          castShadow
          receiveShadow
          visible={true}
          // onPointerDown={() => setIsPaused((prev) => !prev)}
          onPointerDown={(e: any) => {
            if (e.button === 2) {
              e.stopPropagation();
              e.nativeEvent.preventDefault();
              console.log("Right click...");
              setIsOpenHotspotOption(true);
            }else{
              setIsPaused((prev) => !prev)
            }
          }}
        />
      )}
      {isOpenHotspotOption ? (
        <OptionHotspot
          hotspotId={hotspotMedia.id}
          setCurrentHotspotId={setCurrentHotspotId}
          onClose={() => {
            setIsOpenHotspotOption(false);
          }}
          position={[
            hotspotMedia.positionX,
            hotspotMedia.positionY,
            hotspotMedia.positionZ,
          ]}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default VideoMeshComponent;
