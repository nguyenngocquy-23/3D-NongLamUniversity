import React from "react";
import styles from "./navigation.module.css";

const Navigation = () => {
  return (
    <div className={styles.navigation}>
      <header>
        <div className={styles.avatar}>
          <img
            src="https://i.pinimg.com/736x/57/e4/7f/57e47fa25cab8a9b49aca903bfa049a8.jpg"
            alt="avatar"
            className={styles.profileImage}
          />
        </div>
        <span>Admin</span>
      </header>
    </div>
  );
};

export default Navigation;
