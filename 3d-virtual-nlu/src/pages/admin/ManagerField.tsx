import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/user.module.css";
import stylesCommon from "../../styles/common/navigateBar.module.css";
import { FaLock, FaUnlock } from "react-icons/fa";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { MdAdminPanelSettings } from "react-icons/md";
import { Datatable } from "../../components/admin/DataTable";
import { fetchUsers } from "../../redux/slices/DataSlice";
import { formatDateTime } from "../../utils/formatDateTime";
import ModelCreate from "../../components/admin/CustomModal";
import CustomModal from "../../components/admin/CustomModal";
import StatusToggle from "../../components/admin/ToggleChangeStatus";
import FieldCard from "../../components/admin/FieldCard";

interface Field {
  id: number;
  name: string;
  code: string;
  status: number;
  updatedAt: string;
}

const Field = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const fields = useSelector((state: RootState) => state.data.fields) || [];
  const [searchData, setSearchData] = useState<Field[]>([]);
  const [openModel, setOpenModel] = useState(false);

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
    console.log(fields);
    if (fields.length > 0) {
      setSearchData(fields); // Chỉ cập nhật khi users có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải
  }, [fields]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = fields.filter((row) => {
      return (
        row.name.toLowerCase().includes(searchTerm),
        row.code.toLowerCase().includes(searchTerm)
      );
    });
    setSearchData(newData);
  };

  const columns = [
    {
      name: "Mã Lĩnh vực",
      selector: (row: Field) => row.code,
      sortable: true,
      width: "250px",
    },
    {
      name: "Tên Lĩnh vực",
      selector: (row: Field) => row.name,
      sortable: true,
      width: "280px",
    },
    {
      name: "Trạng thái",
      selector: (row: Field) => (
        <StatusToggle
          id={row.id}
          status={row.status}
          apiUrl="http://localhost:8080/api/admin/field/changeStatus"
        />
      ),
      sortable: true,
    },
    {
      name: "Thời gian cập nhật",
      selector: (row: Field) => formatDateTime(row.updatedAt),
      sortable: true,
    },
  ];

  const field = [
    { label: "Tên lĩnh vực", name: "name", type: "text" },
    { label: "Mã", name: "code", type: "text" },
    // Thêm các trường khác nếu cần
  ];

  return (
    <div className={styles.container}>
      <FieldCard />
      <input
        type="text"
        title="Keyword trong tên"
        onChange={handleSearch}
        placeholder="Tìm kiếm..."
        className={stylesCommon.search_input}
      />
      <h2>Danh Sách Lĩnh vực</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        className={stylesCommon.addRow}
        onClick={() => {
          setOpenModel(true);
        }}
      >
        ➕ Thêm dòng
      </button>
      {openModel ? (
        <CustomModal
          onClose={() => setOpenModel(false)}
          title="Tạo Lĩnh vực"
          fields={field}
          apiUrl="http://localhost:8080/api/admin/field" // URL API
        />
      ) : (
        ""
      )}

      <Datatable columns={columns} searchData={searchData!} loading={loading} />
    </div>
  );
};

export default Field;
