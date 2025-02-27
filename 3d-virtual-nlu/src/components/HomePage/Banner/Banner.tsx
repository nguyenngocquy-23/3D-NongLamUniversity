import React, { use, useRef } from "react";
import Header from "../Header/Header";
import Background from "./Background";
import OverlayText from "./OverlayText";
import styles from "./banner.module.css";
import { motion, useScroll, useTransform } from "framer-motion";

const Banner = () => {
  const container = useRef(null);

  //Theo dõi tiến độ scroll
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });

  // const y = useTransform(scrollYProgress, [0, 1], ["0vh", "150vh"]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0vh", "150vh"]); // Nền di chuyển chậm hơn
  const headerY = useTransform(scrollYProgress, [0, 1], ["0vh", "-50vh"]); // Header lùi lên trên
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]); // Overlay mờ dần

  return (
    <div className={styles.homeContainer}>
      <motion.div style={{ y: headerY }}>
        <Header />
      </motion.div>

      <motion.div style={{ y: backgroundY }}>
        <Background />
      </motion.div>

      {/* <motion.div style={{ opacity: overlayOpacity }}>
        <OverlayText />
      </motion.div> */}
    </div>
  );
};

export default Banner;
