import { FaMehRollingEyes, FaRegUserCircle } from "react-icons/fa";
import { NodeObject } from "../../pages/admin/ManagerTour";
import styles from "../../styles/nodeItem.module.css";
import { FaRegCommentDots } from "react-icons/fa6";
import { GoEye } from "react-icons/go";
import { format } from "date-fns";
import { CiImageOn } from "react-icons/ci";
import { MdNavigation } from "react-icons/md";
import { AppDispatch, RootState } from "../../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchUsers } from "../../redux/slices/DataSlice";
import { transformUrlToThumbnailBig } from "../../utils/getCloudinaryURL";
import { getStatusNode } from "../../utils/Constants";
import { RxUpdate } from "react-icons/rx";

interface NodeItemProps {
  onclick: () => void;
  node: NodeObject;
}

export const NodeItem = ({ onclick, node }: NodeItemProps) => {
  const currentUserJson = sessionStorage.getItem("user");
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const users = useSelector((state: RootState) => state.data.users);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (users && users.length > 0) {
      const foundUser = users.find((u) => u.id === node.userId);
      setUser(foundUser || null);
    }
  }, [users, node.userId]);

  return (
    <div className={styles.node_wrapper} onClick={onclick}>
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
        <span className={styles.node_id}>#{node.id}</span>
        {/* <span className={styles.space_field_label}>{node.fieldName}</span> */}
        <span className={styles.node_title} title={node.name}>
          {node.name}
        </span>

        <div className={styles.node_author}>
          <img
            src={user == null ? currentUser.avatar : user.avatar}
            alt="thumbnail-user"
            className={styles.node_thumbnail}
          />
          <p>{user == null ? "admin" : user.username}</p>
        </div>

        <div className={styles.footer}>
          <div
            className={`${styles.status} ${
              node.status == 0
                ? styles.status_stop
                : node.status == 2
                ? styles.status_open
                : styles.status_wait
            }`}
          >
            {getStatusNode(node.status)}
          </div>

          <span className={styles.space_updated_at}>
            <RxUpdate />{" "}
            {node.updatedAt !== null &&
              format(new Date(node.updatedAt), "dd/MM/yyyy ")}
          </span>
        </div>

        {/* <div className={styles.label}> */}
        {/* <div className={styles.num_react}>
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
          </div> */}
        {/* <div
            className={`${styles.status} ${
              node.status == 0
                ? styles.status_stop
                : node.status == 2
                ? styles.status_open
                : styles.status_wait
            }`}
          >
            {getStatusNode(node.status)}
          </div>
        </div> */}
        {/* <div className={styles.footer}>
          <div className={styles.by_user_wrapper}>
            <img
              src={user == null ? currentUser.avatar : user.avatar}
              alt="thumbnail-user"
            />
            <p>{user == null ? "admin" : user.username}</p>
          </div>
          <span className={styles.time}>
            {format(new Date(node.updatedAt), "dd/MM/yyyy ")}
          </span>
        </div> */}
      </div>
    </div>
  );
};
