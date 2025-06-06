import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/user.module.css";
import stylesCommon from "../../styles/common/navigateBar.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { Datatable } from "../../components/admin/DataTable";
import { formatDateTime } from "../../utils/formatDateTime";
import CustomModal from "../../components/admin/CustomModal";
import StatusToggle from "../../components/admin/ToggleChangeStatus";

interface Space {
  id: number;
  fieldName: string;
  name: string;
  description: string;
  status: number;
  updatedAt: string;
}

const Space = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const spaces = useSelector((state: RootState) => state.data.spaces) || [];
  const [searchData, setSearchData] = useState<Space[]>([]);
  const [openModel, setOpenModel] = useState(false);

  useEffect(() => {
    if (
      currentUser == undefined ||
      currentUser == null ||
      (currentUser && currentUser.roleId !== 2)
    ) {
      navigate("/unauthorized");
    }
  }, [currentUser, navigate]);

  // Cập nhật searchData mỗi khi users thay đổi
  useEffect(() => {
    console.log(spaces);
    if (spaces.length > 0) {
      setSearchData(spaces); // Chỉ cập nhật khi users có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải
  }, [spaces]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = spaces.filter((row) => {
      return row.name.toLowerCase().includes(searchTerm);
    });
    setSearchData(newData);
  };

  const columns = [
    {
      name: "ID",
      selector: (row: Space) => row.fieldName,
      sortable: true,
      width: "70px",
    },
    {
      name: "Tên lĩnh vực",
      selector: (row: Space) => row.fieldName,
      sortable: true,
      width: "180px",
    },
    {
      name: "Tên Không gian",
      selector: (row: Space) => row.name,
      sortable: true,
      width: "180px",
    },
    {
      name: "Mô tả",
      selector: (row: Space) => row.description,
      sortable: true,
      width: "180px",
    },
    {
      name: "Trạng thái",
      selector: (row: Space) => <StatusToggle id={row.id} status={row.status} apiUrl="http://localhost:8080/api/admin/space/changeStatus"/>,
      sortable: true,
    },
    {
      name: "Thời gian cập nhật",
      selector: (row: Space) => formatDateTime(row.updatedAt),
      sortable: true,
    },
  ];

  const fields = [
    { label: "Chọn lĩnh vực", name: "fieldId", type: "select" },
    { label: "Tên không gian", name: "name", type: "text" },
    { label: "Mã", name: "code", type: "text" },
    { label: "Mô tả", name: "description", type: "area" },
    { label: "Ảnh đại diện", name: "url", type: "text" },
    // Thêm các trường khác nếu cần
  ];

  return (
    <div className={styles.container}>
      <input
        type="text"
        title="Keyword trong tên hoặc mô tả"
        onChange={handleSearch}
        placeholder="Tìm kiếm..."
        className={stylesCommon.search_input}
      />
      <h2>Danh Sách Không gian</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button className={stylesCommon.addRow} onClick={() => setOpenModel(true)}>➕ Thêm dòng</button>
      {openModel ? (
        <CustomModal
          onClose={() => setOpenModel(false)}
          title="Tạo Không gian"
          fields={fields}
          apiUrl="http://localhost:8080/api/admin/space" // URL API
        />
      ) : (
        ""
      )}

      <Datatable columns={columns} searchData={searchData!} loading={loading} />
    </div>
  );
};

export default Space;
