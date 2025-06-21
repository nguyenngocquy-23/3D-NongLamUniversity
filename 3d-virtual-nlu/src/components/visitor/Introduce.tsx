import React, { useEffect, useState } from "react";
import styles from "../../styles/visitor/introduce.module.css";

const images = [
  {
    src: `${import.meta.env.BASE_URL}thienly.jpg`,
    title: "Toàn Thiên Lý",
    description:
      "Và tòa nhà điều hành của trường, được xem là tòa nhà biểu tượng cho trường. Nơi tiếp nhận và giải quyết các vấn đè của sinh viên.",
  },
  {
    src: `${import.meta.env.BASE_URL}phuongvy.jpg`,
    title: "Giảng đường Phượng Vỹ",
    description:
      "Nơi tổ chức các hoạt động ngoại khóa và chương trình của đoàn hội trường.",
  },
  {
    src: `${import.meta.env.BASE_URL}rangdong.jpg`,
    title: "Giảng đường Rạng Đông",
    description: "Giảng đường có diện tích lớn nhất trường.",
  },
  {
    src: `${import.meta.env.BASE_URL}khoacntt.jpg`,
    title: "Khoa Công nghệ thông tin",
    description:
      "Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.Mô tả không gian.",
  },
  {
    src: `${import.meta.env.BASE_URL}thuvienthunk.jpg`,
    title: "Thư viện",
    description:
      "Nơi trau dồi thêm các kiến thức và nơi họp nhóm lý tưởng cho các sinh viên.",
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
    <div id="introduce" className={styles.virtual_tour_container}>
      <div
        className={styles.vt_background}
        style={{
          backgroundImage: `url(${images[selectedIndex].src})`,
        }}
      ></div>

      <div className={styles.carousel}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.title}
            className={`${styles.carousel_image} ${
              i === selectedIndex ? styles.active_image : ""
            }`}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      <div className={styles.info_panel}>
        <h2>{images[selectedIndex].title}</h2>
        <p>{images[selectedIndex].description}</p>
      </div>
    </div>
  );
}
