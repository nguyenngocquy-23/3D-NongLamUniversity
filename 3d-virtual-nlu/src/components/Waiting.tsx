import React from "react";
import styles from "../styles/waiting.module.css";

const Waiting = ({ percent }: { percent: number }) => {
  return (
    <div className={styles.loading_container}>
      <span className={styles.loader}></span>
      <div className={styles.loading_box}>
        <div className={styles.progress_bar}>
          <div
            className={styles.progress_fill}
            style={{ width: `${percent}%` }}
          >
            <div className={styles.percent_label}>{percent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waiting;
