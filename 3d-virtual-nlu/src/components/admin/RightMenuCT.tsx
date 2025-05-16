import { FaLock } from "react-icons/fa6";
import styles from "../../styles/rightmenu.module.css";
import { MdDoneOutline } from "react-icons/md";
/**
 * - Nhận thấy rằng step 2 & step 3 chia sẻ cùng UI.
 */

interface TaskItem {
  id: number;
  title: string;
}

interface RightMenuProps {
  // tasks: { id: number; title: string; content: React.ReactNode }[];
  tasks: TaskItem[];
  openTaskIndex: number | null;
  unlockedTaskIds: number[];
  completedTaskIds: number[];
  onTaskClick: (id: number) => void;
}

const RightMenuCreateTour: React.FC<RightMenuProps> = ({
  tasks,
  openTaskIndex,
  unlockedTaskIds,
  completedTaskIds,
  onTaskClick,
}) => {
  return (
    <>
      <ul>
        {tasks.map((task) => {
          const isUnlocked = unlockedTaskIds.includes(task.id);
          const isCompleted = completedTaskIds.includes(task.id);
          const isActive = openTaskIndex === task.id;

          return (
            <li
              key={task.id}
              className={styles.taskRow}
              style={{
                cursor: isUnlocked ? "pointer" : "not-allowed",
                borderBottom: isActive ? "2px solid #7FFF00" : "",
              }}
              onClick={() => isUnlocked && onTaskClick(task.id)}
            >
              <span className={styles.taskName}>{task.title}</span>
              {!isUnlocked && <FaLock className={styles.taskIcon} />}
              {isCompleted && <MdDoneOutline className={styles.taskIcon} />}
            </li>
          );
        })}
      </ul>
      <button style={{ position:'absolute', left: '50%', bottom: '20px', transform: 'translateX(-50%)',margin:'auto', textAlign:'center'}}>Tiếp tục</button>
    </>
    // </div>
  );
};

export default RightMenuCreateTour;
