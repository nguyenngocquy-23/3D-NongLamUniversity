import React from "react";
import styles from "../styles/waiting.module.css";

const Waiting = ({ percent }: { percent: number }) => {
  return (
    <div className={styles.loading_container}>
      <video
        className={styles.video}
        src={`${import.meta.env.BASE_URL}loadingNLU.mp4`}
        autoPlay
        muted
        loop
      />
      {/* <div className={styles.shadow}></div> */}
      <div className={styles.loading_box}>
        <div className={styles.progress_bar}>
          <div
            className={styles.progress_fill}
            style={{ width: `${percent}%` }}
          >
            <div className={styles.percent_label }>{percent}%</div>
          </div>
        </div>
        {/* <div className={styles.percent}>{percent}%</div> */}
      </div>
    </div>
  );
};

export default Waiting;
