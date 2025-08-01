import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import {
  fetchFields,
  fetchIcons,
  fetchNodes,
  fetchSpaces,
} from "../../redux/slices/DataSlice";
import styles from "../../styles/toggleChangeStatus.module.css";
import { perPage } from "../../utils/Constants";
import { updatePanoConfig } from "../../redux/slices/PanoramaSlice";
import Swal from "sweetalert2";

type StatusToggleProps = {
  id: number;
  status: number;
  apiUrl: string; // URL để gọi PUT hoặc POST cập nhật status
  type: string;
  editable?: boolean;
};

const StatusToggle: React.FC<StatusToggleProps> = ({
  id,
  status,
  apiUrl,
  type,
  editable,
}) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const toggle = useRef<number>(status);
  useEffect(() => {
    toggle.current = status;
  }, [id, status]);

  const handleToggleStatus = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toggle.current = !e.target.checked ? 0 : type == "node" ? 2 : 1;
    setLoading(true);
    try {
      const response = await axios.post(apiUrl, { id, status: toggle.current });
      if (response.data.data) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật trạng thái thành công.",
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
        });
        switch (type) {
          case "field":
            dispatch(fetchFields({ limit: perPage, page: 0 }));
            break;

          case "space":
            dispatch(fetchIcons());
            dispatch(fetchSpaces({ limit: perPage, page: 0 }));
            break;

          case "icon":
            dispatch(fetchIcons());
            break;
          case "node":
            dispatch(fetchNodes({ limit: perPage, page: 0 }));
            dispatch(
              updatePanoConfig({
                id: `${id}`,
                config: {
                  status: toggle.current,
                },
              })
            );
            break;
          default:
            break;
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Cập nhật trạng thái không thành công. Vui lòng thử lại sau.",
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Cập nhật trạng thái không thành công. Vui lòng thử lại sau.",
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
      });
      toggle.current = status;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.field_status_toggle}>
      <input
        id="checkbox"
        type="checkbox"
        checked={toggle.current > 0}
        title={toggle.current == 0 ? "Kích hoạt" : "Vô hiệu hóa"}
        onChange={id > 0 ? handleToggleStatus : undefined}
        disabled={loading}
        style={{
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      />
    </div>
  );
};

export default StatusToggle;
