import React, { useEffect, useState } from "react";
import styles from "../../styles/visitor/introduce2.module.css";
import { useDispatch } from "react-redux";
import { API_URLS } from "../../env";
import axios from "axios";

export default function Introduce2() {
  const [images, setImages] = useState<any>([]);
  return (
    <div id="introduce" className={styles.virtual_tour_container}>
      {/* Section 1 */}
      <div className={styles.section}>
        <div className={styles.imageWrap}>
          <img src={`${import.meta.env.BASE_URL}create-tour.png`} />
        </div>

        <div className={styles.content}>
          <h2>Tạo tour ảo thu hút người xem và quản bá không gian</h2>
          <p>
            Trình chỉnh sửa của chúng tôi đơn giản nhưng được tích hợp đầy đủ
            các tính năng mạnh mẽ. Với gói PRO, bạn có thể tạo không giới hạn
            tour, thêm nhãn, hotspot tuỳ chỉnh, âm thanh nền, thẻ tương tác và
            hình ảnh, video minh họa.
          </p>
          <button
            onClick={() =>
              window.open("https://youtu.be/b0hkZynGmy4", "_blank")
            }
          >
            Xem video demo
          </button>
        </div>
      </div>

      {/* Section 2 (đảo cột) */}
      <div className={`${styles.section} ${styles.reverse}`}>
        <div className={styles.imageWrap}>
          <img src={`${import.meta.env.BASE_URL}mockup-view-space.png`} />
        </div>
        <div className={styles.content}>
          <h2>Trình phát tour ảo 3D 360° mượt mà và tối ưu nhất trên web</h2>
          <p>
            Đừng chỉ hiển thị hình ảnh cho khách hàng – hãy mang đến cho họ một
            trải nghiệm trực quan và sống động. Với tour ảo 3D 360°, người xem
            có thể tự do khám phá không gian, cảm nhận chân thực từng chi tiết
            như đang có mặt tại đó.
          </p>
        </div>
      </div>

      {/* Section 3 */}
      <div className={styles.section}>
        <div className={styles.imageWrap}>
          <img
            src={`${import.meta.env.BASE_URL}mockup-mobile.png`}
            style={{ boxShadow: "none" }}
          />
        </div>

        <div className={styles.content}>
          <h2>Dễ dàng chia sẻ, nhúng và tích hợp vào website</h2>
          <p>
            Tour ảo là giải pháp hiệu quả để tăng mức độ tương tác của người
            dùng và thu hút khách hàng tiềm năng. Nhờ khả năng khám phá không
            gian một cách trực quan, tour ảo giúp người xem ở lại lâu hơn, ghi
            nhớ thương hiệu tốt hơn và dễ dàng đưa ra quyết định hơn.
          </p>
          <button>Tìm hiểu thêm</button>
        </div>
      </div>
    </div>
  );
}
