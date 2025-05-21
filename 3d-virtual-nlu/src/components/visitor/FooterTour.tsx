import React from "react";
import styles from "../../styles/footerTour.module.css";
import {
  IoIosCloseCircle,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import { FaLanguage, FaPause, FaPlay } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

interface FooterTourProps {
  isAnimation: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  toggleInformation: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

const FooterTour = ({
  isAnimation,
  isMuted,
  isFullscreen,
  toggleInformation,
  toggleMute,
  toggleFullscreen,
}: FooterTourProps) => {
  {
    /* Footer chứa các tính năng trong tour*/
  }
  return (
    <div className={styles.footerTour}>
      <i>NLU360</i>
      <div className="contain_extension" style={{ display: "flex" }}>
        <FaPause
          className={styles.pauseBtn}
          style={{ display: isAnimation ? "block" : "none" }}
        />
        <FaPlay
          className={styles.playBtn}
          style={{ display: isAnimation ? "none" : "block" }}
        />
        <FaLanguage className={styles.info_btn} onClick={toggleInformation} />
        {isMuted ? (
          <IoMdVolumeOff className={styles.info_btn} onClick={toggleMute} />
        ) : (
          <IoMdVolumeHigh className={styles.info_btn} onClick={toggleMute} />
        )}
        <FaInfoCircle className={styles.info_btn} onClick={toggleInformation} />
        {isFullscreen ? (
          <MdFullscreenExit
            className={styles.fullscreen_btn}
            onClick={toggleFullscreen}
          />
        ) : (
          <MdFullscreen
            className={styles.fullscreen_btn}
            onClick={toggleFullscreen}
          />
        )}
      </div>
    </div>
  );
};

export default FooterTour;
