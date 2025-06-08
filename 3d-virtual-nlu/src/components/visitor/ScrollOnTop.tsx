import React, { useState, useEffect } from "react";
import styles from '../../styles/scrollOnTop.module.css'
import { FaAngleUp } from "react-icons/fa6";

const ScrollOnTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return visible ? (
    <button
      onClick={scrollToTop}
      className={styles.button}
      aria-label="Scroll to top"
      title="Về đầu trang"
    >
      <FaAngleUp/>
    </button>
  ) : null;
};

export default ScrollOnTop;
