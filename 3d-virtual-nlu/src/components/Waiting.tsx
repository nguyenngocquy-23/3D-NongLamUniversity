import React from "react";
import styles from "../styles/waiting.module.css";

const Waiting = () => {
  return <div className={styles.loading_container}>
    <video className={styles.video} src="/loadingNLU.mp4" autoPlay muted loop></video>
    <div className={styles.shadow}></div>
  </div>;
};

export default Waiting;
