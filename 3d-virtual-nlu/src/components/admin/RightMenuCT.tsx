import { FaLock } from "react-icons/fa6";
import styles from "../../styles/rightmenu.module.css";
import { MdDoneOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { nextStep } from "../../redux/slices/StepSlice";
import Swal from "sweetalert2";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper";
import { RootState } from "../../redux/Store";
import axios from "axios";
import { API_URLS } from "../../env";
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
  onTaskClick: (id: number) => void;
  setPreOpenTask: (id: number) => void;
  saveLinkNode: boolean;
}

const RightMenuCreateTour: React.FC<RightMenuProps> = ({
  tasks,
  openTaskIndex,
  onTaskClick,
  setPreOpenTask,
  saveLinkNode,
}) => {
  const dispatch = useDispatch();
  return (
    <>
      <ul>
        {tasks.map((task) => {
          const isActive = openTaskIndex === task.id;

          return (
            <li
              key={task.id}
              className={styles.taskRow}
              style={{
                borderBottom: isActive ? "2px solid #7FFF00" : "",
              }}
              onClick={() => {
                onTaskClick(task.id);
                setPreOpenTask(task.id);
              }}
            >
              <span className={styles.taskName}>{task.title}</span>
            </li>
          );
        })}
      </ul>
      {saveLinkNode ? (
        ""
      ) : (
        <button
          style={{
            position: "absolute",
            left: "50%",
            bottom: "20px",
            transform: "translateX(-50%)",
            margin: "auto",
            textAlign: "center",
            padding: "0.5rem 1rem",
          }}
          onClick={() => {
            dispatch(nextStep());
          }}
        >
          Tiếp tục
        </button>
      )}
    </>
    // </div>
  );
};

export default RightMenuCreateTour;
