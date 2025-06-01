import styles from '../../styles/visitor/tours.module.css'

const VisitorTours = () => {
  return (
    <div className={styles.container}>
      <div className={styles.tour}>
        <span className={styles.name}>Tên tour 1</span>
      </div>
      <div className={styles.tour}>
        <span className={styles.name}>Tên tour 2</span>
      </div>
      <div className={styles.tour}>
        <span className={styles.name}>Tên tour 3</span>
      </div>
    </div>
  )
}

export default VisitorTours;
