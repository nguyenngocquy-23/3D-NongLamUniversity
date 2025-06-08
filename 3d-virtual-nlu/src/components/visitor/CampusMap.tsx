import styles from "../../styles/campusMap.module.css";

const CampusMap = () => {
  return (
    <section id="campusMap" className={styles.campusMapContainer}>
      <h2 className={styles.title}>Sơ đồ trường</h2>
      <div className={styles.map}/>
    </section>
  );
};

export default CampusMap;
