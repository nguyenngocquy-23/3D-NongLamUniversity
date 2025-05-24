import { useRef } from "react";
import { OrthographicCamera } from "three";

const Minimap = () => {
  const mapCamera = useRef<OrthographicCamera>(null);

  return (
    <>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#4caf50" />
      </mesh>
      {/* <gridHelper args={[50, 10, "white", "white"]} /> */}
    </>
  );
};

export default Minimap;
