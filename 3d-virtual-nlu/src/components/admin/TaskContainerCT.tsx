/**
 * Chính là nội dung của từng item trong RightMenuCT. => WRAPPER COMPONENT.
 * => Khi click vào item nào, nó sẽ hiển thị TaskContainerCT tương ứng.
 * id & name: Lấy lại dựa trên data của item.
 * content: lấy từ biến content của item. //ReactNode: là bất kỳ kiểu gì cũng được, có thể là number, string, <Component> hoặc 1 danh thẻ div ,...
 * onSave: Nhằm lưu giá trị mới vào Redux và thông báo cho RightMenuCT rằng có thể chuyển đến item mới.
 *
 */

import React from "react";
import styles from "../../styles/taskcontainerct.module.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { setMasterPanorama } from "../../redux/slices/PanoramaSlice";

interface TaskContainerCTProps {
  id: number | null;
  name: string | null;
  onSave: () => void;
  children: React.ReactNode;
}
const TaskContainerCT: React.FC<TaskContainerCTProps> = ({
  id,
  name,
  children,
  onSave,
}) => {
  const { panoramaList } = useSelector((state: RootState) => ({
    panoramaList: state.panoramas.panoramaList,
  }));
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className={styles.task_container}>
      <div className={styles.task_header}>
        <h3>{name}</h3>
        {id === 3 ? <span>Vị trí muốn để</span> : ""}
      </div>
      <div className={styles.task_content}>{children}</div>
      <div className={styles.tast_choose}>
        <div className={styles.contain_input}>
          <label className={styles.label}>Ảnh trung tâm:</label>
          <select
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                dispatch(setMasterPanorama(selectedId));
              }
            }}
          >
            <option value="">Chọn panorama</option>
            {panoramaList.map((pano) => (
              <option key={pano.id} value={pano.id}>
                {pano.config.name || "null"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskContainerCT;
