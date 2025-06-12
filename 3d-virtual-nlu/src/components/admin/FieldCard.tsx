import { IoMdTime } from "react-icons/io";
import styles from "../../styles/fieldCard.module.css";
import { IoSettings } from "react-icons/io5";
import Space from "../../pages/admin/ManagerSpace";
import { format } from "date-fns";
import { RxUpdate } from "react-icons/rx";

interface Field {
  id: number;
  name: string;
  code: string;
  status: number;
  updatedAt: number | null;
  listSpace: Space[];
}

type FieldCardProps = {
  field: Field;
};
const FieldCard: React.FC<FieldCardProps> = ({ field }) => {
  return (
    <div className={styles.field_wrapper}>
      <div
        className={styles.field_card}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}backgroundNL.jpg)`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      ></div>
      <div className={styles.field_content}>
        <span className={styles.field_id}>#{field.id}</span>
        <span className={styles.field_title}>{field.name}</span>
        <span className={styles.field_code}>
          ({field.listSpace.length} không gian)
        </span>
        <div className={styles.field_bottom}>
          {field.status > 0 ? (
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

          <span className={styles.field_updated_at}>
            <RxUpdate />{" "}
            {field.updatedAt !== null &&
              format(new Date(field.updatedAt), "dd/MM/yyyy ")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FieldCard;
