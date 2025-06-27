import { NodeObject } from "../../pages/admin/BoardFeatureTour";
import styles from "../../styles/nodeItem.module.css";
import { useState } from "react";

interface NodeItemProps {
  onclick: () => void;
  node: NodeObject;
}

export const NodeItem = ({ onclick, node }: NodeItemProps) => {
  const [isShow, setIsShow] = useState(false);

  const handleMouseEnter = () => {
    setIsShow(true);
  };
  const handleMouseLeave = () => {
    setIsShow(false);
  };
  return (
    <div className={styles.container} onClick={onclick}>
      <div
        className={styles.info}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img src={node.url} alt="" />
        <div className={styles.name}>
          <span>
            {node?.name} #{node.id}
          </span>
        </div>

        <div className={styles.footer}>
          <div
            className={`${styles.status} ${
              node.status === 0 ? styles.status_stop : styles.status_open
            }`}
          >
            {node.status == 0 ? (
              <span>Hoạt động</span>
            ) : node.status == 1 ? (
              <span>Tạm ngưng</span>
            ) : (
              <span>Đang hoạt động</span>
            )}
          </div>
          {/* <b>{formatTimestampToDate(updatedAt)}</b> */}
        </div>
        <hr />
        <div className={styles.by_user}>
          <div className={styles.by_user_wrapper}>
            {/* <img src="/avatar.jpg" alt="" /> */}
            <p>
              <ins>Người tạo: </ins>
              {node.userId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
