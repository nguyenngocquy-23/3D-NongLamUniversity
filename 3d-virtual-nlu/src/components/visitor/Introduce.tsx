import React, { useEffect, useState } from "react";
import styles from "../../styles/visitor/introduce.module.css";

const images = [
  {
    src: "/khoa.jpg",
    title: "Khoa Công nghệ thông tin",
    description: "Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.",
  },
  {
    src: "https://picsum.photos/id/1012/400/300",
    title: "Không gian 2",
    description: "Mô tả không gian 2.",
  },
  {
    src: "https://picsum.photos/id/1013/400/300",
    title: "Không gian 3",
    description: "Mô tả không gian 3.",
  },
  {
    src: "https://picsum.photos/id/1015/400/300",
    title: "Không gian 4",
    description: "Mô tả không gian 4.",
  },
  {
    src: "https://picsum.photos/id/1016/400/300",
    title: "Không gian 5",
    description: "Mô tả không gian 5.",
  },
];

export default function Introduce() {
  const [selectedIndex, setSelectedIndex] = useState(2); // mặc định ảnh giữa
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearTimeout(timer); // clear timeout khi unmount hoặc khi selectedIndex thay đổi
  }, [selectedIndex]);
  return (
    <div id="introduce" className={styles.virtualTourContainer}>
      <div
        className={styles.vtBackground}
        style={{
          filter: "blur(4px) brightness(0.7)",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${images[selectedIndex].src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      ></div>

      <div className={styles.carousel}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.title}
            className={`${styles.carouselImage} ${
              i === selectedIndex ? styles.activeImage : ""
            }`}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      <div className={styles.infoPanel}>
        <h2>{images[selectedIndex].title}</h2>
        <p>{images[selectedIndex].description}</p>
      </div>
    </div>
  );
}
