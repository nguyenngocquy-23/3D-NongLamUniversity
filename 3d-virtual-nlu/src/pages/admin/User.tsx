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

interface User {
  id: number;
  username: string;
  email: string;
  status: number;
  roleId: number;
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
      (currentUser && currentUser.roleId !== 2)
    ) {
      navigate("/unauthorized");
    } else {
      setLoading(true);
      dispatch(fetchUsers());
    }
  }, [currentUser, navigate, dispatch]);

  // Cập nhật searchData mỗi khi users thay đổi
  useEffect(() => {
    console.log(users)
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
      await axios.put(
        `https://localhost:7125/User/toggleLockStatus/${userId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (isLock)
        Swal.fire({
          title: "Đã khóa tài khoản!",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
          toast: true,
          timerProgressBar: true,
        });
      else
        Swal.fire({
          title: "Đã mở tài khoản!",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
          toast: true,
          timerProgressBar: true,
        });
      fetchUsers();
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
      name: "Trạng thái",
      cell: (row: User) =>
        row.roleId === 0 ? (
          <button
            style={{ margin: "auto", cursor: "pointer" }}
            onClick={() => {
              if (row.status === 1) {
                toggleLockStatus(row.id, true);
              } else if (row.status === 0) {
                toggleLockStatus(row.id, false);
              }
            }}
          >
            {row.status === 0 ? (
              <FaLock style={{ color: "red" }} />
            ) : (
              <FaUnlock />
            )}
          </button>
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
      <input
        type="text"
        title="Keyword trong tiêu đề và mô tả ngắn"
        onChange={handleSearch}
        placeholder="Tìm kiếm..."
        className="search-input"
        style={{
          position: "absolute",
          top: "5px",
          left: "10px",
          width: "20%",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <h2>Danh Sách Người Dùng</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Datatable columns={columns} searchData={searchData!} loading={loading} />
    </div>
  );
}

export default User;
