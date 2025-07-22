import { FaMehRollingEyes } from "react-icons/fa";
import { NodeObject } from "../../pages/admin/ManagerTour";
import styles from "../../styles/nodeItem.module.css";
import { FaRegCommentDots } from "react-icons/fa6";
import { GoEye } from "react-icons/go";
import { format } from "date-fns";
import { CiImageOn } from "react-icons/ci";
import { MdNavigation } from "react-icons/md";
import { AppDispatch, RootState } from "../../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchUsers } from "../../redux/slices/DataSlice";
import { transformUrlToThumbnailBig } from "../../utils/getCloudinaryURL";

interface NodeItemProps {
  onclick: () => void;
  node: NodeObject;
}

export const NodeItem = ({ onclick, node }: NodeItemProps) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const users = useSelector((state: RootState) => state.data.users);

  const username = users
    ? users.find((u) => u.id === node.userId)?.username
    : "Unknown User";

  return (
    <div className={styles.node_wrapper} onClick={onclick}>
      {/* <div className={styles.node_content_left}>
        <img
          src={node.url}
          alt="thumbnail-node"
          aria-placeholder="backgroundNL.jpg"
        />
      </div> */}

      <div
        className={styles.node_card}
        style={{
          backgroundImage: `url(${transformUrlToThumbnailBig(node.url)})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className={styles.node_content}>
        <div className={styles.name}>
          <span>
            [{node.id}] - {node?.name}
          </span>
        </div>

        <div className={styles.label}>
          <div className={styles.num_react}>
            <GoEye />
            1.5K
          </div>
          <div className={styles.num_react}>
            <FaRegCommentDots />
            540
          </div>
          <div className={styles.num_react}>
            <CiImageOn />5
          </div>
          <div className={styles.num_react}>
            <MdNavigation />
            500
          </div>
          <div
            className={`${styles.status} ${
              node.status == 0
                ? styles.status_stop
                : node.status == 2
                ? styles.status_open
                : styles.status_wait
            }`}
          >
            {node.status == 0 ? (
              <span>Tạm ngưng</span>
            ) : node.status == 2 ? (
              <span>Hoạt động</span>
            ) : (
              <span>Chờ duyệt</span>
            )}
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.by_user_wrapper}>
            <img src={node.url} alt="thumbnail-user" />
            <p>{!users ? node.userId : !username ? "admin" : username}</p>
          </div>
          <span className={styles.time}>
            {format(new Date(node.updatedAt), "dd/MM/yyyy ")}
          </span>
        </div>
      </div>
    </div>
  );
};
