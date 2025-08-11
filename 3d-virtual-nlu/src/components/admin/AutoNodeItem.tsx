import styles from "../../styles/nodeItem.module.css";
import { format } from "date-fns";
import { AppDispatch, RootState } from "../../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchUsers } from "../../redux/slices/DataSlice";

interface AutoNodeItemProps {
  onclick: () => void;
  node: any;
}

export const AutoNodeItem = ({ onclick, node }: AutoNodeItemProps) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const users = useSelector((state: RootState) => state.data.users);

  return (
    <div className={styles.node_wrapper} onClick={onclick}>
      <div
        className={styles.node_card}
        style={{
          backgroundImage: `url(${node.thumbNail})`,
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
        <div className={styles.footer}>
          <div
            className={`${styles.status} ${
              node.status == 0 ? styles.status_stop : styles.status_open
            }`}
          >
            {node.status == 0 ? <span>Tạm ngưng</span> : <span>Hoạt động</span>}
          </div>
          <span className={styles.time}>
            {format(new Date(node.updatedAt), "dd/MM/yyyy ")}
          </span>
        </div>
      </div>
    </div>
  );
};
