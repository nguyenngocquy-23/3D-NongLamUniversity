import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/user.module.css";
import { FaLock, FaUnlock } from "react-icons/fa";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { MdAdminPanelSettings } from "react-icons/md";

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  status: number;
  role: number;
}

function User() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [searchData, setSearchData] = useState<User[]>();

  const dispatch = useDispatch();
  useEffect(() => {
    if (
      currentUser == undefined ||
      currentUser == null ||
      (currentUser && currentUser.roleId !== 2)
    ) {
      navigate("/unauthorized");
    } else {
      fetchUsers();
    }
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    console.log("dang fetch");
    try {
      console.log("dang lay api");
      const response = await axios.get(`https://localhost:7125/User/getAll`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setUsers(response.data);
      setSearchData(response.data);
      console.log(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg =
          typeof err.response?.data === "string"
            ? err.response.data
            : "Không thể lấy danh sách user. Vui lòng thử lại sau";
        setError(errorMsg);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData = users.filter((row) => {
      return (
        row.fullName.toLowerCase().includes(event.target.value.toLowerCase()) ||
        row.username.toLowerCase().includes(event.target.value.toLowerCase()) ||
        row.email.toLowerCase().includes(event.target.value.toLowerCase())
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
      name: "Tên Tài Khoản",
      selector: (row: User) => row.fullName,
      sortable: true,
      width: "170px",
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
      name: "Số điện thoại",
      selector: (row: User) => row.phoneNumber,
      sortable: true,
      width: "200px",
    },
    {
      name: "Trạng thái",
      cell: (row: User) =>
        row.role === 1 ? (
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

      <div className={styles.dataTable}>
        <DataTable
          columns={columns}
          data={searchData!}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent="Không có dữ liệu để hiển thị"
          customStyles={{
            headCells: {
              style: {
                fontSize: "17px",
                background: "#009879",
                color: "#ffffff",
                textAlign: "left",
                fontWeight: "bold",
              },
            },
            cells: {
              style: {
                borderCollapse: "collapse",
                fontSize: "15px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                height: "auto",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default User;
