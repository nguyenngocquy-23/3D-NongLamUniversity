import styles from "../../styles/visitor/tours.module.css";
import CreateNode from "../../features/CreateTour";

const VisitorCreateTour = () => {
  return (
    <div className={styles.container}>
      <CreateNode />
    </div>
  );
};

export default VisitorCreateTour;
