import { useEffect, useState } from "react";
import styles from "../../styles/visitor/footer.module.css";
import { Link as ScrollLink } from "react-scroll";

export default function Footer() {
  const partners = [
    "https://www.fujinet.net/bundles/home/images/logo.svg?v94",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/TMA-Solutions-Logo.png/250px-TMA-Solutions-Logo.png",
    "https://htsv.hcmuaf.edu.vn/wp-content/uploads/2023/10/logo.jpg",
    "https://htsv.hcmuaf.edu.vn/wp-content/uploads/2023/07/tai-xuong-4-300x64.png",
    "https://vieclamthienkhoi.vn/wp-content/uploads/2023/09/logo_h.png",
    "https://htsv.hcmuaf.edu.vn/wp-content/uploads/2023/07/tai-xuong-6.png",
    "https://htsv.hcmuaf.edu.vn/wp-content/uploads/2023/07/tai-xuong-5-e1690518629896.png",
    "https://htsv.hcmuaf.edu.vn/wp-content/uploads/2022/11/c581837d42b939141575709212798572.png",
  ];

  // Lặp để tạo hiệu ứng trượt liên tục
  const duplicatedPartners = [...partners, ...partners];
  const [openForm, setOpenForm] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY; // vị trí hiện tại cuộn
      const windowHeight = window.innerHeight; // chiều cao màn hình
      const fullHeight = document.documentElement.scrollHeight; // tổng chiều cao trang

      const checkOpenForm = sessionStorage.getItem("openForm");
      if (scrollTop + windowHeight >= fullHeight && !checkOpenForm) {
        setOpenForm(true);
        sessionStorage.setItem("openForm", "true");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeContent}>
          {duplicatedPartners.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt={`Partner ${index + 1}`}
              className={styles.partner_logo}
            />
          ))}
        </div>
      </div> */}
      {openForm && (
        <div className={styles.form_overlay}>
          <button
            className={styles.close_button}
            onClick={() => setOpenForm(false)}
          >
            ✕
          </button>
          {isLoading ?? (
            <p className={styles.loading_text}>Đang tải biểu mẫu…</p>
          )}
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLScElOrAKgZkPc-kUJ3_WagD0lFFktzmNOoLEMLFLqFyZJ7wSQ/viewform?embedded=true"
            className={styles.form_container}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.text}>
            &copy; {new Date().getFullYear()} Công ty của bạn. Mọi quyền được
            bảo lưu.
          </p>
          <div className={styles.links}>
            <ScrollLink
              to="introduce"
              className={styles.navLink}
              smooth={true}
              duration={800}
            >
              Giới thiệu
            </ScrollLink>

            <ScrollLink
              to="tourOverview"
              className={styles.navLink}
              smooth={true}
              duration={800}
            >
              Khám phá tour ảo
            </ScrollLink>
            <ScrollLink
              to="contact"
              className={styles.navLink}
              smooth={true}
              offset={-40}
              duration={800}
            >
              Liên hệ
            </ScrollLink>
            <button
              className={styles.feed_back_button}
              onClick={() => setOpenForm(true)}
            >
              Khảo sát & đánh giá
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
