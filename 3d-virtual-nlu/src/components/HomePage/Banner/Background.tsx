import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { useEffect, useRef } from "react";

import "./Background.css";

const images = [
  { src: "/src/assets/picture/background.png", className: "parallax bg-img" },
  { src: "/src/assets/picture/fog_7.png", className: "parallax fog-7" },
  {
    src: "/src/assets/picture/mountain_10.png",
    className: "parallax mountain-10",
  },
  { src: "/src/assets/picture/fog_6.png", className: "parallax fog-6" },
  {
    src: "/src/assets/picture/mountain_9.png",
    className: "parallax mountain-9",
  },
  {
    src: "/src/assets/picture/mountain_8.png",
    className: "parallax mountain-8",
  },
  { src: "/src/assets/picture/fog_5.png", className: "parallax fog-5" },
  {
    src: "/src/assets/picture/mountain_7.png",
    className: "parallax mountain-7",
  },
  {
    src: "/src/assets/picture/mountain_6.png",
    className: "parallax mountain-6",
  },
  { src: "/src/assets/picture/fog_4.png", className: "parallax fog-4" },
  {
    src: "/src/assets/picture/mountain_5.png",
    className: "parallax mountain-5",
  },
  { src: "/src/assets/picture/fog_3.png", className: "parallax fog-3" },
  {
    src: "/src/assets/picture/mountain_4.png",
    className: "parallax mountain-4",
  },
  {
    src: "/src/assets/picture/mountain_3.png",
    className: "parallax mountain-3",
  },
  { src: "/src/assets/picture/fog_2.png", className: "parallax fog-2" },
  {
    src: "/src/assets/picture/mountain_2.png",
    className: "parallax mountain-2",
  },
  {
    src: "/src/assets/picture/mountain_1.png",
    className: "parallax mountain-1",
  },
  { src: "/src/assets/picture/sun_rays.png", className: "sun_rays" },
  { src: "/src/assets/picture/black_shadow.png", className: "black-shadow" },
  { src: "/src/assets/picture/fog_1.png", className: "parallax fog-1" },
];

const Background: React.FC = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  return (
    <main ref={parallaxRef}>
      {images.map((img, index) => (
        <img key={index} src={img.src} alt="" className={img.className} />
      ))}

      {/* Text Layer */}
      <div className="text parallax">
        <h2>Tham quan ảo</h2>
        <h1>NLU360</h1>
      </div>
      <div className="vignette"></div>
    </main>
  );
};
export default Background;
