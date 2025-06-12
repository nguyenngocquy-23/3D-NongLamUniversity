import { RxUpdate } from "react-icons/rx";
import styles from "../../styles/spaceCard.module.css";
import Space from "../../pages/admin/ManagerSpace";
import { format } from "date-fns";
import { MdNotStarted } from "react-icons/md";
import { FaPlayCircle } from "react-icons/fa";

type SpaceCardProps = {
  space: Space;
};
const SpaceCard: React.FC<SpaceCardProps> = ({ space }) => {
  return (
    <div className={styles.space_wrapper}>
      <div
        className={styles.space_card}
        style={{
          backgroundImage: `url(${space.url})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      ></div>
      <div className={styles.space_content}>
        <span className={styles.space_id}>#{space.id}</span>
        <span className={styles.space_field_label}>{space.fieldName}</span>
        <span className={styles.space_title}>{space.name}</span>
        <span className={styles.space_start_node}>
          <FaPlayCircle />
          {space.masterNodeName}
        </span>
        <div className={styles.space_bottom}>
          {space.status > 0 ? (
            <div
              className={styles.status}
              style={{
                backgroundColor: "#0e9013",
              }}
            >
              <span>Hoạt động</span>
            </div>
          ) : (
            <div
              className={styles.status}
              style={{
                backgroundColor: "#f9a620",
              }}
            >
              <span>Tạm ngưng</span>
            </div>
          )}

          <span className={styles.space_updated_at}>
            <RxUpdate />{" "}
            {space.updatedAt !== null &&
              format(new Date(space.updatedAt), "dd/MM/yyyy ")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
