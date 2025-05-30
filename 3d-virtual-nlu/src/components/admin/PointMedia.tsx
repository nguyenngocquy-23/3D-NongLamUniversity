import React, { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDispatch } from "react-redux";
import { updateCornerHotspotMedia } from "../../redux/slices/HotspotSlice";

type PointMediaProps = {
  hotspotId: string;
  index: number;
  cornerPointList: [number, number, number][];
  onDragEnd?: () => void;
};

const PointMedia: React.FC<PointMediaProps> = ({
  hotspotId,
  index,
  cornerPointList,
  onDragEnd,
}) => {
  console.log('cornerPointList..', cornerPointList)
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = new THREE.TextureLoader().load("/under.png");
  const { camera, gl } = useThree();
  const dispatch = useDispatch();

  const [isDragging, setIsDragging] = useState(false);
  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouse = useRef(new THREE.Vector2()).current;

  const isDraggingRef = useRef(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // useEffect(() => {
  //   const onMouseMove = (event: MouseEvent) => {
  //     const rect = gl.domElement.getBoundingClientRect();
  //     mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  //     mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  //   };

  //   window.addEventListener("mousemove", onMouseMove);
  //   return () => window.removeEventListener("mousemove", onMouseMove);
  // }, [gl, mouse]);

  // useEffect(() => {
  //   const onMouseUp = () => {
  //     if (isDraggingRef.current) {
  //       setIsDragging(false);

  //       // Cập nhật đỉnh mới
  //       const newCornerList = [...cornerPointList];
  //       const newPos = meshRef.current?.position;
  //       if (newPos) {
  //         newCornerList[index] = [newPos.x, newPos.y, newPos.z];

  //         dispatch(
  //           updateCornerHotspotMedia({
  //             hotspotId,
  //             cornerPointList: newCornerList,
  //           })
  //         );
  //       }

  //       onDragEnd?.(); // mở lại control
  //     }
  //   };

  //   window.addEventListener("mouseup", onMouseUp);
  //   return () => window.removeEventListener("mouseup", onMouseUp);
  // }, [cornerPointList, hotspotId, index, dispatch, onDragEnd]);

  // const handlePointerDown = (e: React.PointerEvent) => {
  //   e.stopPropagation();
  //   if (e.button === 2) {
  //     setIsDragging(true);
  //   }
  // };

  // const handleContextMenu = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  // useFrame(() => {
  //   if (isDragging && meshRef.current) {
  //     const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  //     const intersection = new THREE.Vector3();
  //     raycaster.setFromCamera(mouse, camera);
  //     raycaster.ray.intersectPlane(plane, intersection);
  //     meshRef.current.position.copy(intersection);
  //   }
  // });

  return (
    <mesh
      ref={meshRef}
      position={cornerPointList[index]}
      // onPointerDown={handlePointerDown}
      // onContextMenu={handleContextMenu}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

export default PointMedia;
