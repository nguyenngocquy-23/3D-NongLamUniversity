import React from "react";
import styles from "../../styles/footerTour.module.css";
import {
  IoIosCloseCircle,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import { FaComment, FaLanguage, FaPause, FaPlay } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface FooterTourProps {
  isRotation: boolean;
  setIsRotation: (val: boolean) => void;
  isMuted: boolean;
  isFullscreen: boolean;
  toggleInformation: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setIsComment: (val: boolean) => void;
  accessing: any;
}

const FooterTour = ({
  isRotation,
  setIsRotation,
  isMuted,
  isFullscreen,
  toggleInformation,
  toggleMute,
  toggleFullscreen,
  setIsComment,
  accessing,
}: FooterTourProps) => {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const navigate = useNavigate();
  return (
    <div className={styles.footerTour}>
      <i>Số lượng truy cập hiện tại: {accessing}</i>
      <div className="contain_extension" style={{ display: "flex" }}>
        <FaComment
          className={styles.info_btn}
          onClick={() => {
            user
              ? setIsComment(true)
              : Swal.fire({
                  title: "Bạn cần đăng nhập để bình luận",
                  icon: "info",
                  confirmButtonText: "Đăng nhập",
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate("/login");
                  }
                });
          }}
        />
        <FaPause
          className={styles.pauseBtn}
          style={{ display: isRotation ? "block" : "none" }}
          onClick={() => {
            setIsRotation(false);
          }}
        />
        <FaPlay
          className={styles.playBtn}
          style={{ display: isRotation ? "none" : "block" }}
          onClick={() => {
            setIsRotation(true);
          }}
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
