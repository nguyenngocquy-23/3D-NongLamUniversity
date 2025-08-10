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
import { useEffect, useMemo } from "react";
import { getHotspotLinkMap } from "../../redux/slices/Selectors";
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
      });
      return;
    }
    if (!isFullConnected) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng kiểm tra lại các điểm tương tác đến các ảnh trong cùng tour!",
        toast: true,
        position: "top-end",
        showConfirmButton: true,
      });
      return;
    }

    dispatch(nextStep());
  };
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const filterPanoramaList = panoramaList.filter((p) => p.config.status !== 0);
  /** Filter ra các panos khác tour (Khi update)
   * + status = 2 # với node hiện tại.
   * + status = 0
   */

  const masterPanorama = panoramaList.find((h) => h.config.status > 1);
  const linkMap = useSelector(getHotspotLinkMap); // Lấy ra được 1 tập hợp Map.
  const panoramaSubItemIds = panoramaList
    .filter((p) => p.config.status === 1)
    .map((p) => p.id);

  const isFullConnected = useMemo(() => {
    // Nếu không có slave → coi như đã full connected
    if (panoramaSubItemIds.length === 0) return true;
    if (!masterPanorama || !linkMap.has(masterPanorama.id)) return false;

    // Master phải trỏ đến tất cả slave
    const fromMaster = linkMap.get(masterPanorama.id) ?? new Set();
    const toAllSlaves = panoramaSubItemIds.every((pId) => fromMaster.has(pId));

    // Mỗi slave phải có hotspot trỏ ngược về master
    const allSlavesPointBack = panoramaSubItemIds.every((pId) => {
      const links = linkMap.get(pId);
      return links?.has(masterPanorama.id);
    });

    return toAllSlaves && allSlavesPointBack;
  }, [linkMap, masterPanorama, panoramaSubItemIds]);

  useEffect(() => {
    if (panoramaList.length === 0) return;
    const isValid = panoramaList.every(
      (p) => p.config.name != "" && p.config.name?.length <= 50
    );
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
