import React, { useEffect, useState } from "react";
import styles from "../../styles/visitor/introduce.module.css";

const images = [
  {
    src: "/thienly.jpg",
    title: "Toàn Thiên Lý",
    description: "Và tòa nhà điều hành của trường, được xem là tòa nhà biểu tượng cho trường. Nơi tiếp nhận và giải quyết các vấn đè của sinh viên.",
  },
  {
    src: "/phuongvy.jpg",
    title: "Giảng đường Phượng Vỹ",
    description: "Nơi tổ chức các hoạt động ngoại khóa và chương trình của đoàn hội trường.",
  },
  {
    src: "/rangdong.jpg",
    title: "Giảng đưuòng Rạng Đông",
    description: "Giảng đường có diện tích lớn nhất trường.",
  },
  {
    src: "/khoa.jpg",
    title: "Khoa Công nghệ thông tin",
    description: "Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.",
  },
  {
    src: "/thuvienthunk.jpg",
    title: "Thư viện",
    description: "Nơi trau dồi thêm các kiến thức và nơi họp nhóm lý tưởng cho các sinh viên.",
  },
];

export default function Introduce() {
  const [selectedIndex, setSelectedIndex] = useState(2); // mặc định ảnh giữa
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearTimeout(timer);
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
