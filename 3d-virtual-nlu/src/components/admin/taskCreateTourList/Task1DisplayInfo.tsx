import styles from "../../../styles/tasklistCT/task1.module.css";
interface Task1Props {
  nameNode: string;
  setNameNode: (nameNode: string) => void;
  desNode: string;
  setDesNode: (desNode: string) => void;
}

const Task1DisplayInfo = ({
  nameNode,
  setNameNode,
  desNode,
  setDesNode,
}: Task1Props) => (
  <div className={styles.task1}>
    <div className={styles.contain_input}>
      <label className={styles.label}>Tên:</label>
      <input
        type="text"
        className={styles.name_input}
        placeholder="Tên không gian"
        value={nameNode}
        onChange={(e) => setNameNode(e.target.value)}
      />
    </div>
    <div className={styles.contain_input}>
      <label className={styles.label}>Giới thiệu:</label>
      <textarea
        className={styles.descript_input}
        placeholder="Mô tả không gian.."
        value={desNode}
        onChange={(e) => setDesNode(e.target.value)}
      />
    </div>
  </div>
);

export default Task1DisplayInfo;
