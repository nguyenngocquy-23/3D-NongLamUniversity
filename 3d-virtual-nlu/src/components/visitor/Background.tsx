import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { useEffect, useRef } from "react";

import styles from "../../styles/background.module.css";

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

  const addFogAnimation = () => {
    // Tìm tất cả các phần tử có className chứa "fog"
    const fogElements = document.querySelectorAll("[class*='fog']");

    fogElements.forEach((element, index) => {
      // Tạo các giá trị ngẫu nhiên cho các keyframe
      const randomYPosition = Math.random() * 100 - 50; // Di chuyển ngẫu nhiên lên xuống trong phạm vi -5 đến 5
      const randomDuration = Math.random() * 2 + 5; // Thời gian chuyển động ngẫu nhiên từ 3s đến 8s

      // Tạo keyframe động cho hiệu ứng di chuyển ngẫu nhiên
      const animationName = `fogAnimation_${index}`;
      const styleSheet = document.styleSheets[0];

      // Thêm CSS animation vào stylesheet
      // styleSheet.insertRule(
      //   `
      //   @keyframes ${animationName} {
      //     0% {
      //       transform: translateX(0);
      //     }
      //     50% {
      //       transform: translateX(${randomYPosition}px);
      //     }
      //     100% {
      //       transform: translateX(0);
      //     }
      //   }

      // `
      // );

      // Áp dụng animation cho phần tử
      (
        element as HTMLElement
      ).style.animation = `${animationName} ${randomDuration}s infinite ease-in-out`;
    });
  };

  useEffect(() => {
    // Gọi hàm để thêm animation cho các phần tử khi component được mount
    addFogAnimation();
  }, []);

  const addMountainAnimation = () => {
    // Tìm tất cả các phần tử có className chứa "fog"
    const fogElements = document.querySelectorAll("[class*='mountain']");

    fogElements.forEach((element, index) => {
      // Tạo các giá trị ngẫu nhiên cho các keyframe
      const randomYPosition = Math.random() * 100 - 50; // Di chuyển ngẫu nhiên lên xuống trong phạm vi -5 đến 5
      const randomDuration = Math.random() * 2 + 5; // Thời gian chuyển động ngẫu nhiên từ 3s đến 8s

      // Tạo keyframe động cho hiệu ứng di chuyển ngẫu nhiên
      const animationName = `fogAnimation_${index}`;
      const styleSheet = document.styleSheets[0];

      // Thêm CSS animation vào stylesheet
      styleSheet.insertRule(
        `

        @keyframes ${animationName} {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(${randomYPosition}px);
          }
          100% {
            transform: translateY(0);
          }
        }

      `,
        styleSheet.cssRules.length
      );

      // Áp dụng animation cho phần tử

      (
        element as HTMLElement
      ).style.animation = `${animationName} ${randomDuration}s infinite ease-in-out`;
    });
  };

  // useEffect(() => {
  //   // Gọi hàm để thêm animation cho các phần tử khi component được mount
  //   addMountainAnimation();
  // }, []);

  return (
    <main ref={parallaxRef}>
      {/* {images.map((img, index) => (
        <img key={index} src={img.src} alt="" className={img.className} />
      ))} */}

      {/* Text Layer */}
      <div
        className="text parallax"
        style={{
          color: "black",
          position: "absolute",
          zIndex: "3",
          top: "5%",
          left: "50%",
          transform: "translate(-50%,50%)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "30px", color: "white" }}>THAM QUAN</h2>
        <h2 style={{ fontSize: "50px", color: "white" }}>TRƯỜNG ĐẠI HỌC</h2>
        <h2
          style={{
            fontSize: "100px",
            color: "transparent",
            WebkitTextStroke: "2px white",
            // textShadow:
              // "-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white",
          }}
        >
          NÔNG LÂM
        </h2>

        <h2 style={{ fontSize: "40px", color: "white" }}>
          THÀNH PHỐ HỒ CHÍ MINH
        </h2>
      </div>
      <div
        style={{
          position: "absolute",
          backgroundColor: "rgba(0,0,0,0.3)",
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      ></div>
      <div
        className="vignette"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: "0",
          zIndex: "1",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ minWidth: "100%", minHeight: "100%" }}
        >
          <source src="/public/background.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
    </main>
  );
};
export default Background;
