import styles from "../../styles/rightmenu.module.css";
/**
 * - Nhận thấy rằng step 2 & step 3 chia sẻ cùng UI.
 */
type RightMenuProps = {
  tasks: { id: number; title: string; content: React.ReactNode }[];
  activeTaskId: number;
  completedTaskIds: number[];
  onSelectTask: (id: number) => void;
  openTaskIndex: number | null;
  setOpenTaskIndex: (id: number) => void;
};

const RightMenuCreateTour: React.FC<RightMenuProps> = ({
  tasks,
  activeTaskId,
  completedTaskIds,
  openTaskIndex,
  setOpenTaskIndex,
  onSelectTask,
}) => {
  return (
    <>
      <ul>
        {tasks.map((task) => {
          const isOpen = openTaskIndex === task.id;
          const isUnlocked =
            task.id === 1 || completedTaskIds.includes(task.id - 1);

          return (
            <li
              key={task.id}
              className={styles.taskRow}
              onClick={() => isUnlocked && onSelectTask(task.id)}
            >
              <span className={styles.taskName}>{task.title}</span>
            </li>
          );
        })}
      </ul>
    </>
    // </div>
  );
};

export default RightMenuCreateTour;
