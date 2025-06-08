import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/Store";
import { fetchFields } from "../../redux/slices/DataSlice";
import styles from "../../styles/toggleChangeStatus.module.css";

type StatusToggleProps = {
  id: number;
  status: number;
  apiUrl: string; // URL để gọi PUT hoặc POST cập nhật status
};

const StatusToggle: React.FC<StatusToggleProps> = ({ id, status, apiUrl }) => {
  const [loading, setLoading] = useState(false);

  // const [toggle, setToggle] = useState(status);
  // useEffect(() => {
  //   setToggle(status);
  // }, [status]);

  const dispatch = useDispatch<AppDispatch>();

  const handleToggleStatus = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const newToggle = checked ? 1 : 0;

    setLoading(true);

    try {
      await axios.post(apiUrl, { id, status: newToggle });
      dispatch(fetchFields());
    } catch (err) {
      console.error("Cập nhật trạng thái thất bại:", err);
      alert("Không thể cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.field_status_toggle}>
      <input
        id="checkbox"
        type="checkbox"
        checked={status > 0}
        onChange={id > 0 ? handleToggleStatus : undefined}
        disabled={loading}
        style={{
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      />
      {/* <div>{loading ? "Đang gửi..." : toggle === 1 ? "Tắt" : "Bật"}</div> */}
    </div>
  );
};

export default StatusToggle;
