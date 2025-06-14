import React, { useEffect, useMemo, useState } from "react";
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
import { format } from "date-fns";

interface Icon {
  id: number;
  name: string;
  url: string;
  isActive: number;
  createdAt: string;
}

const ManagerIcon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const icons = useSelector((state: RootState) => state.data.icons) || [];
  const [searchData, setSearchData] = useState<Icon[]>([]);
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
    console.log(icons);
    if (icons.length > 0) {
      setSearchData(icons); // Chỉ cập nhật khi users có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải
  }, [icons]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = icons.filter((row) => {
      return row.name.toLowerCase().includes(searchTerm);
    });
    setSearchData(newData);
  };

  const columns = [
    {
      name: "Mã",
      selector: (row: Icon) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "Tên biểu tượng",
      selector: (row: Icon) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "Ảnh",
      selector: (row: Icon) => (
        <span title={row.url}>{row.url}</span> // row.title là title bạn muốn hiển thị
      ),
      sortable: true,
      width: "400px",
    },
    {
      name: "Trạng thái",
      selector: (row: Icon) => (
        <StatusToggle
          id={row.id}
          status={row.isActive}
          apiUrl="http://localhost:8080/api/admin/field/changeStatus"
        />
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Thời gian cập nhật",
      selector: (row: Icon) =>
        format(new Date(row.createdAt), "dd/MM/yyyy HH:mm"),
      sortable: true,
    },
  ];

  const field = [
    { label: "Tên Icon", name: "name", type: "text" },
    // { label: "Mã", name: "code", type: "text" },
    { label: "File Icon", name: "iconUrl", type: "text" },
    // Thêm các trường khác nếu cần
  ];
  const [color, setColor] = useState("#ff0000");

  const [svgContent, setSvgContent] = useState<string>(
    ""
    // `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    //     <circle cx="50" cy="50" r="40" fill="#000000"/>
    //   </svg>`
    // "https://res.cloudinary.com/dkoc6kbg1/image/upload/v1746934824/client_upload/panoramas/PXL_20250510_085706510.PHOTOSPHERE.jpg"
  );
  // const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    fetch(
      "https://res.cloudinary.com/dkoc6kbg1/image/upload/v1746948459/client_upload/panoramas/sm8phywzxsoc4b2rfbd9.svg"
    )
      .then((res) => res.text()) // Đọc SVG như văn bản
      .then((text) => setSvgContent(text))
      .catch((error) => {
        console.error("Error loading SVG:", error);
      });
  }, []);
  const coloredSvg = useMemo(() => {
    if (!svgContent) return "";

    // BƯỚC 1: Thay tất cả fill="..." và stroke="..." thành currentColor
    let updatedSvg = svgContent
      .replace(/fill="[^"]*"/g, 'fill="currentColor"') // thay fill
      .replace(/stroke="[^"]*"/g, 'stroke="currentColor"'); // thay stroke

    // BƯỚC 2: Với các thẻ như path, circle, rect... nếu KHÔNG có fill và KHÔNG có style
    // thì thêm style="fill: currentColor" để đảm bảo nó vẫn đổi màu
    updatedSvg = updatedSvg.replace(
      /<(\w+)([^>]*)\/?>/g,
      (fullMatch, tagName, attrs) => {
        const isShapeTag = /^(path|circle|rect|polygon|line|ellipse)$/.test(
          tagName
        );
        const hasFill = /fill=/.test(attrs);
        const hasStyle = /style=/.test(attrs);

        if (isShapeTag && !hasFill && !hasStyle) {
          return `<${tagName} style="fill: currentColor" ${attrs}>`;
        }

        return fullMatch;
      }
    );

    return updatedSvg;
  }, [svgContent]);

  return (
    <div className={styles.container}>
      <input
        type="text"
        title="Keyword trong tên"
        onChange={handleSearch}
        placeholder="Tìm kiếm..."
        className={stylesCommon.search_input}
      />
      <h2>Danh Sách biểu tượng</h2>
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
          title="Tạo biểu tượng"
          fields={field}
          apiUrl="http://localhost:8080/api/v1/admin/icon"
        />
      ) : (
        ""
      )}
      {/* <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <div
        style={{ color: color, marginLeft: "500px" }}
        dangerouslySetInnerHTML={{ __html: coloredSvg }}
      /> */}
      <Datatable columns={columns} searchData={searchData!} loading={loading} />
    </div>
  );
};

export default ManagerIcon;
