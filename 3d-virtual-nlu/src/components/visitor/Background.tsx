import { useEffect, useRef } from "react";
import styles from "../../styles/background.module.css";

const Background: React.FC = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // useEffect(() => {
  //   const video = videoRef.current;
  //   if (!video) return;

  //   const handleCanPlay = () => {
  //     // ✅ Khi video đã tải đủ → mới bắt đầu phát
  //     video.play().catch((err) => {
  //       console.warn("Autoplay bị chặn:", err);
  //     });
  //   };

  //   video.addEventListener("canplaythrough", handleCanPlay);

  //   return () => video.removeEventListener("canplaythrough", handleCanPlay);
  // }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    fetch(`${import.meta.env.BASE_URL}backgroundv1.mp4`)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        video.src = blobUrl;
        video.load();

        video.oncanplaythrough = () => {
          video.play().catch((err) => {
            console.warn("Autoplay bị chặn:", err);
          });
        };
      });
  }, []);

  return (
    <main ref={parallaxRef} className={styles.main}>
      <div className={`${styles.text} parallax`}>
        <h2 className={styles.title_small}>THAM QUAN</h2>
        <h2 className={styles.title_medium}>TRƯỜNG ĐẠI HỌC</h2>
        <h2 className={styles.title_large_stroke}>NÔNG LÂM</h2>
        <h2 className={styles.title_city}>THÀNH PHỐ HỒ CHÍ MINH</h2>
      </div>

      <div className={styles.overlay}></div>

      <div className={styles.vignette}>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          poster={`${import.meta.env.BASE_URL}thumnailVideoBackgorund.png`} // ✅ Thêm ảnh đại diện khung đầu
          className={styles.video}
        >
          <source
            src={`${import.meta.env.BASE_URL}backgroundv1.mp4`}
            type="video/mp4"
          />
          Trình duyệt không hỗ trợ video.
        </video>
      </div>
    </main>
  );
};
export default Background;
