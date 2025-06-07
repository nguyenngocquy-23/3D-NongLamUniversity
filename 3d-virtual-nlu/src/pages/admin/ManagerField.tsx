import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import styles from "../../styles/managerField.module.css";

import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";

import { fetchUsers } from "../../redux/slices/DataSlice";

import FieldCard from "../../components/admin/FieldCard";
import { IoSearch } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { TiFilter } from "react-icons/ti";
import { FaSortAmountDown } from "react-icons/fa";
import Space from "./ManagerSpace";

interface Field {
  id: number;
  name: string;
  code: string;
  status: number;
  updatedAt: string;
  listSpace: Space[];
}

const Field: React.FC<Field> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const fields = useSelector((state: RootState) => state.data.fields) || [];
  const spaces = useSelector((state: RootState) => state.data.spaces) || [];
  const [selectedField, setSelectedField] = useState<Field | null>(null);
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

  return (
    <>
      <div className={styles.container}>
        <div className={styles.field_features}>
          <div className={`${styles.field_search_box} ${styles.field_box}`}>
            <input
              type="text"
              name="field"
              id="input"
              placeholder="Tìm kiếm lĩnh vực..."
              className={styles.field_search_input}
            />
            <label htmlFor="input" className={styles.label_for_search}>
              <IoSearch className={styles.search_icon} />
            </label>
            <div className={styles.border}></div>
            <button className={styles.mic_search}>
              <FaMicrophone className={styles.mic_icon} />
            </button>
          </div>

          <div className={`${styles.field_filter_box} ${styles.field_box}`}>
            <TiFilter className={styles.filter_icon} />
            <button className={styles.filter_popup}>Lọc</button>
          </div>

          <div className={`${styles.field_sort_box} ${styles.field_box}`}>
            <FaSortAmountDown className={styles.sort_icon} />
            <button className={styles.filter_popup}>Tên</button>
          </div>

          <button className={`${styles.field_add} ${styles.field_box}`}>
            Thêm lĩnh vực
          </button>
        </div>
        <hr className={styles.break} />
        <div className={styles.field_quantity}>
          Kết quả: {fields.length} lĩnh vực.
        </div>

        <div className={styles.field_list}>
          {fields.map((field) => {
            const listSpace = spaces.filter((s) => s.fieldId === field.id);
            return (
              <div
                key={field.id}
                className={styles.field_item}
                onClick={() => setSelectedField({ ...field, listSpace })}
              >
                <FieldCard field={{ ...field, listSpace }} />
              </div>
            );
          })}
        </div>

        {/* <input
        type="text"
        ti              tle="Keyword trong tên"
        onChange={handleSearch}
        placeholder="Tìm kiếm..."
        className={stylesCommon.search_input}
      /> */}
        {/* <h2>Danh Sách Lĩnh vực</h2> */}
        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* <button
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
      
      <Datatable columns={columns} searchData={searchData!} loading={loading} /> */}
      </div>

      {selectedField && (
        <div className={styles.field_edit_by_id}>
          <span>{selectedField.name}</span>
        </div>
      )}
    </>
  );
};

export default Field;
