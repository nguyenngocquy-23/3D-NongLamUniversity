import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/dashboard.module.css";
import {
  FaEye,
  FaUsers,
  FaMapMarkedAlt,
  FaRegCommentDots,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUserPlus,
} from "react-icons/fa";
import { AppDispatch, RootState } from "../../redux/Store";
import { useEffect } from "react";

const Dashboard = () => {
  const data = useSelector((state: RootState) => state.data.dashboard);
  if (!data) return <div>Đang tải dữ liệu thống kê...</div>;

  const stats = [
    {
      title: "Lượt truy cập",
      icon: <FaEye />,
      value: data.numCurrentAccess,
      color: "#4caf50",
      size: "large", // Quan trọng
    },
    {
      title: "Số tour tham quan",
      icon: <FaMapMarkedAlt />,
      value: data.numTour,
      color: "#2196f3",
      size: "medium",
    },
    {
      title: "Người đăng ký (tháng)",
      icon: <FaUserPlus />,
      value: data.numRegister,
      color: "#9c27b0",
      size: "medium",
    },
    {
      title: "Lượt xem không đăng ký",
      icon: <FaUsers />,
      value: data.numFreeAccess,
      color: "#ff9800",
      size: "small",
    },
    {
      title: "Số bình luận",
      icon: <FaRegCommentDots />,
      value: data.numComment,
      color: "#3f51b5",
      size: "small",
    },
    {
      title: "Tour chưa duyệt",
      icon: <FaTimesCircle />,
      value: data.numTourWaitingApprovel,
      color: "#f44336",
      size: "small",
    },
    {
      title: "Tour bị báo cáo",
      icon: <FaExclamationTriangle />,
      value: data.numReport,
      color: "#e91e63",
      size: "small",
    },
  ];

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.stat_grid}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${styles.stat_card} ${styles[stat.size]}`}
            style={{ borderLeft: `5px solid ${stat.color}` }}
          >
            <div className={styles.stat_icon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.stat_info}>
              <p className={styles.stat_title}>{stat.title}</p>
              <p className={styles.stat_value}>{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
