import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef } from "react";
import styles from "./VirtualTour.module.css";

const VirtualTour = () => {
  const container = useRef<HTMLDivElement>(null);

  const scroll = useScroll();

  const y = useTransform(scroll.scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  return (
    <div
      ref={container}
      className={styles.virtualTourContainer}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className={styles.vtBackground}>
        <motion.div style={{ y }} className={styles.vtBackgroundImage}>
          <img
            src="/src/assets/picture/thienly.jpg"
            alt="rang-dong"
            className={styles.vtImage}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default VirtualTour;
