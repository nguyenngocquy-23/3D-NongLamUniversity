import React, { use, useRef } from "react";
import Header from "./Header";
import Background from "./Background";
import styles from "../../styles/banner.module.css";
import { motion, useScroll, useTransform } from "framer-motion";

const Banner: React.FC = () => {
  const container = useRef(null);

  //Theo dõi tiến độ scroll
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0vh", "-150vh"]); // Nền di chuyển chậm hơn
  const headerY = useTransform(scrollYProgress, [0, 1], ["0vh", "-50vh"]); // Header lùi lên trên

  return (
    <div className={styles.homeContainer} ref={container}>
      <motion.div style={{ y: headerY }} >
        <Header />
      </motion.div>

      <motion.div style={{ y: backgroundY }}>
        <Background />
      </motion.div>
    </div>
  );
};

export default Banner;
