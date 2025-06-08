import React, { useState } from "react";
import { motion } from "framer-motion";
import { CiMinimize1, CiMinimize2 } from "react-icons/ci";
import styles from "../../styles/virtualTour.module.css";

const FullScreenToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullScreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  return (
    <motion.button
      className={className}
      onClick={toggleFullScreen}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      {isFullScreen ? <CiMinimize1 /> : <CiMinimize2 />}
    </motion.button>
  );
};

export default FullScreenToggle;
