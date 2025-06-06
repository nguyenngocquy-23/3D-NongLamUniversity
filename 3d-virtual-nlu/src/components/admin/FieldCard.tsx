import React from "react";
import styles from "../../styles/fieldCard.module.css";

const FieldCard = () => {
  return (
    <div className={styles.field_card}>
      <span className={styles.field_id}>#1</span>
      <span className={styles.field_title}>Học tập</span>
      <div className={styles.field_bottom}>
        <span className={styles.status}>Hoạt động</span>
        <span className={styles.field_updated_at}> Cập nhật lần cuối</span>
      </div>
    </div>
  );
};

export default FieldCard;
