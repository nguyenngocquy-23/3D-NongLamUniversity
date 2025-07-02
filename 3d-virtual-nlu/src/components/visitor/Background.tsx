import { useEffect, useRef } from "react";
import styles from "../../styles/background.module.css";

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
      (
        element as HTMLElement
      ).style.animation = `${animationName} ${randomDuration}s infinite ease-in-out`;
    });
  };

  useEffect(() => {
    // Gọi hàm để thêm animation cho các phần tử khi component được mount
    addFogAnimation();
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
        {/* <video autoPlay loop muted playsInline className={styles.video}>
          <source
            src={`${import.meta.env.BASE_URL}background.mp4`}
            type="video/mp4"
          />
          Trình duyệt của bạn không hỗ trợ video.
        </video> */}
      </div>
    </main>
  );
};
export default Background;
