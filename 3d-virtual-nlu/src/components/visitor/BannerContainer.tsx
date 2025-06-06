import React, { use, useRef } from "react";
import Header from "./Header";
import Background from "./Background";
import styles from "../../styles/banner.module.css";
import { motion, useScroll, useTransform } from "framer-motion";

const Banner: React.FC = () => {
  const container = useRef(null);

  return (
    <div className={styles.homeContainer} ref={container}>
        <Header />
        <Background />
    </div>
  );
};

export default Banner;
