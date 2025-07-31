import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/user.module.css";
import { FaLock, FaUnlock } from "react-icons/fa";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { MdAdminPanelSettings } from "react-icons/md";
import { Datatable } from "../../components/admin/DataTable";
import { fetchUsers } from "../../redux/slices/DataSlice";
import { API_URLS } from "../../env";
import { IoSearch } from "react-icons/io5";
import { formatTimestampToDate } from "../../utils/formatDateTime";

interface User {
  id: number;
  username: string;
  email: string;
  status: number;
  roleId: number;
  createdAt: number;
}

function User() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  // const [users, setUsers] = useState<User[]>([]);
  const users = useSelector((state: RootState) => state.data.users) || [];
  const [searchData, setSearchData] = useState<User[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (
      currentUser == undefined ||
      currentUser == null ||
      (currentUser && currentUser.roleId !== 2 && currentUser.roleId !== 3)
    ) {
      navigate("/unauthorized");
    } else {
      setLoading(true);
      dispatch(fetchUsers());
    }
  }, [currentUser, navigate, dispatch]);

  // Cập nhật searchData mỗi khi users thay đổi
  useEffect(() => {
    if (users.length > 0) {
      setSearchData(users); // Chỉ cập nhật khi users có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải
  }, [users]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = users.filter((row) => {
      return (
        row.username.toLowerCase().includes(searchTerm) ||
        row.email.toLowerCase().includes(searchTerm)
      );
    });
    setSearchData(newData);
  };

  const toggleLockStatus = async (userId: number, isLock: boolean) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URLS.BASE}/user/toggleLockStatus`,
        {
          userId: userId,
        }
      );
      if (response.data.data) {
        if (isLock)
          Swal.fire({
            title: "Đã khóa tài khoản!",
            icon: "success",
            showConfirmButton: false,
            timer: 1000,
            toast: true,
            timerProgressBar: true,
            position: "top-end",
          });
        else
          Swal.fire({
            title: "Đã mở tài khoản!",
            icon: "success",
            showConfirmButton: false,
            timer: 1000,
            toast: true,
            timerProgressBar: true,
            position: "top-end",
          });
      }
      dispatch(fetchUsers()); // Cập nhật lại danh sách người dùng sau khi thay đổi trạng thái
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg =
          typeof err.response?.data === "string"
            ? err.response.data
            : "Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại sau";
        setError(errorMsg);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "ID",
      selector: (row: User) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: "Tên Đăng Nhập",
      selector: (row: User) => row.username,
      sortable: true,
      width: "180px",
    },
    {
      name: "Email",
      selector: (row: User) => row.email,
      sortable: true,
    },
    {
      name: "Thời gian tạo",
      selector: (row: User) => formatTimestampToDate(row.createdAt),
      sortable: true,
    },
    {
      name: "Trạng thái",
      cell: (row: User) =>
        row.roleId === 0 ? (
          row.status != 1 ? (
            <button
              className={styles.status_button}
              onClick={() => {
                if (row.status == 2) {
                  toggleLockStatus(row.id, true);
                } else if (row.status == 0) {
                  toggleLockStatus(row.id, false);
                }
              }}
              title={row.status == 2 ? "khóa tài khoản" : "mở tài khoản"}
              style={{ backgroundColor: row.status == 0 ? "red" : "green" }}
            >
              {row.status === 0 ? (
                <FaLock />
              ) : (
                <FaUnlock />
              )}
            </button>
          ) : (
            <span
              style={{
                padding: "0.3rem ",
                backgroundColor: "orange",
                borderRadius: "5px",
              }}
            >
              Đang xác thực
            </span>
          )
        ) : (
          <MdAdminPanelSettings
            style={{ margin: "auto", fontSize: "25px", color: "#009879" }}
            title="Admin nè"
          />
        ),
      sortable: true,
      width: "150px",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.search_box}>
        <label htmlFor="input" className={styles.label}>
          <IoSearch className={styles.search_icon} />
        </label>
        <input
          type="text"
          name="field"
          id="input"
          placeholder="Tìm kiếm..."
          className={styles.search_input}
          onChange={handleSearch}
        />
      </div>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Datatable columns={columns} searchData={searchData!} loading={loading} />
    </div>
  );
}

export default User;
