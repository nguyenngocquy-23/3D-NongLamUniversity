import { useNavigate } from "react-router-dom";
import styles from "../../styles/visitor/tours.module.css";

const VisitorTours = () => {
  const navigate = useNavigate();

  const handleDetail = (nodeId: number) => {
    navigate(`/manage/tour/${nodeId}`);
  };
  return (
    <div className={styles.container}>
      <div className={styles.tour} onClick={() => handleDetail(1)}>
        <span className={styles.name}>Tên tour 1</span>
      </div>
      <div className={styles.tour} onClick={() => handleDetail(1)}>
        <span className={styles.name}>Tên tour 2</span>
      </div>
      <div className={styles.tour} onClick={() => handleDetail(1)}>
        <span className={styles.name}>Tên tour 3</span>
      </div>
    </div>
  );
};

export default VisitorTours;
