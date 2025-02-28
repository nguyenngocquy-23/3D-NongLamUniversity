import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef } from "react";
import styles from "./touroverview.module.css";

const TourOverview = () => {
  const container = useRef<HTMLDivElement>(null);

  const scroll = useScroll();

  const y = useTransform(scroll.scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  return (
    <div
      id="tourOverview"
      ref={container}
      className={styles.virtualTourContainer}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className={styles.vtBackground}>
        <motion.div style={{ y }} className={styles.vtBackgroundImage}>
          <h2>Tham quan ảo</h2>
          <img
            src="/src/assets/picture/background.png"
            alt="rang-dong"
            className={styles.vtImage}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default TourOverview;
