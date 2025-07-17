import React from "react";

const FallbackHotspot = () => {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#ccc" transparent opacity={0.4} />
    </mesh>
  );
};

export default FallbackHotspot;
