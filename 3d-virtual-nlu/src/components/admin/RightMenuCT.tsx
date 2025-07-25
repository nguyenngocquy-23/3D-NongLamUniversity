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
import { useEffect } from "react";
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
  isUpdateTour?: boolean;
  handleUpdateTour?: () => void;
  saveLinkNode: boolean;
  isValidated?: boolean;
  setIsValidated?: (isValid: boolean) => void;
}

const RightMenuCreateTour: React.FC<RightMenuProps> = ({
  tasks,
  openTaskIndex,
  onTaskClick,
  setPreOpenTask,
  isUpdateTour,
  handleUpdateTour,
  saveLinkNode,
  isValidated,
  setIsValidated,
}) => {
  const dispatch = useDispatch();
  const handleNextStep = () => {
    if (!isValidated) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng hoàn thành các trường bắt buộc trước khi tiếp tục!",
        toast: true,
        position: "top-end",
        showConfirmButton: true,
        timer: 3000,
      });
      return;
    }
    dispatch(nextStep());
  };
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  useEffect(() => {
    if (panoramaList.length === 0) return;
    const isValid = panoramaList.every(
      (p) => p.config.name !== "" && p.config.name?.length <= 50
    );
    console.log("panoramaList", isValid, panoramaList);

    setIsValidated?.(isValid);
  }, [panoramaList, setIsValidated]);

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
              {task.id == 1 && !isValidated && (
                <span className={styles.validate_task1} />
              )}
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
            isUpdateTour ? handleUpdateTour?.() : handleNextStep();
          }}
        >
          {isUpdateTour ? "Cập nhật" : "Tiếp tục"}
        </button>
      )}
    </>
    // </div>
  );
};

export default RightMenuCreateTour;
