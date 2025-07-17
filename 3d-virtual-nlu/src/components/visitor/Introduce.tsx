import React, { useEffect, useState } from "react";
import styles from "../../styles/visitor/introduce.module.css";
import { useDeviceInfo } from "../../contexts/DeviceInfoContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import { API_URLS } from "../../env";
import axios from "axios";

// const images = [
//   {
//     url: `${import.meta.env.BASE_URL}thienly.jpg`,
//     title: "Toàn Thiên Lý",
//     description:
//       "Và tòa nhà điều hành của trường, được xem là tòa nhà biểu tượng cho trường. Nơi tiếp nhận và giải quyết các vấn đè của sinh viên.",
//   },
//   {
//     url: `${import.meta.env.BASE_URL}phuongvy.jpg`,
//     title: "Giảng đường Phượng Vỹ",
//     description:
//       "Nơi tổ chức các hoạt động ngoại khóa và chương trình của đoàn hội trường.",
//   },
//   {
//     url: `${import.meta.env.BASE_URL}rangdong.jpg`,
//     title: "Giảng đường Rạng Đông",
//     description: "Giảng đường có diện tích lớn nhất trường.",
//   },
//   {
//     url: `${import.meta.env.BASE_URL}backgroundNL.jpg`,
//     title: "Khuôn viên trước tòa Thiên Lý",
//     description:
//       "Nơi diễn ra các hoạt động ngoài trời của trường, như lễ tốt nghiệp, các buổi giao lưu văn nghệ.",
//   },
//   {
//     url: `${import.meta.env.BASE_URL}thuvienthunk.jpg`,
//     title: "Thư viện",
//     description:
//       "Nơi trau dồi thêm các kiến thức và nơi họp nhóm lý tưởng cho các sinh viên.",
//   },
// ];

export default function Introduce() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(
      "Images:",
      images.length,
      " - - ",
      selectedIndex,
      " - - ",
      images[selectedIndex]
    );
  }, [selectedIndex]);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await axios.get(API_URLS.GET_ALL_SPACES);
        const data = response.data?.data || [];
        const formattedImages = data.map((space: any) => ({
          url: space.url,
          title: space.name,
          description: space.description,
        }));
        setImages(formattedImages);
      } catch (error) {
        console.error("Lỗi fetchSpace:", error);
      } finally {
        setIsLoading(false); // kết thúc loading dù thành công hay lỗi
      }
    };

    fetchSpace();
  }, []);

  useEffect(() => {
    if (images.length === 0) return; // ✅ Chặn khi chưa load xong ảnh

    const timer = setTimeout(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedIndex, images.length]);

  if (isLoading) {
    return <div>Đang tải ảnh...</div>;
  }

  if (!images.length) {
    return <div>Không có ảnh nào để hiển thị</div>;
  }
  return (
    <div id="introduce" className={styles.virtual_tour_container}>
      <div
        className={styles.vt_background}
        style={{
          backgroundImage: `url(${images[selectedIndex]?.url})`,
        }}
      ></div>

      <div className={styles.carousel}>
        {images.map((img: any, i: any) => (
          <img
            key={i}
            src={img.url}
            alt={img.title}
            className={`${styles.carousel_image} ${
              i === selectedIndex ? styles.active_image : ""
            }`}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      <div className={styles.info_panel}>
        <h2>{images[selectedIndex]?.title}</h2>
        <p>{images[selectedIndex]?.description}</p>
      </div>
    </div>
  );
}
