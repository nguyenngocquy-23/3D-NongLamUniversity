import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import styles from "../../styles/managerField.module.css";

import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";

import { fetchFields, fetchUsers } from "../../redux/slices/DataSlice";

import FieldCard from "../../components/admin/FieldCard";
import { IoSearch } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { TiFilter } from "react-icons/ti";
import { FaSave, FaSortAmountDown } from "react-icons/fa";
import Space from "./ManagerSpace";
import { RiEdit2Line } from "react-icons/ri";
import StatusToggle from "../../components/admin/ToggleChangeStatus";
import { TfiNewWindow } from "react-icons/tfi";
import { IoIosCloseCircle, IoIosWarning } from "react-icons/io";
import { RemoveVietnameseTones } from "../../utils/RemoveVietnameseTones";
import axios from "axios";
import { validateName } from "../../utils/ValidateInputName";
import { format, parseISO } from "date-fns";
import { parseDateFromArray } from "../../utils/formatDateTime";

interface Field {
  id: number;
  name: string | null;
  code: string;
  status: number;
  createdAt: number | null;
  updatedAt: number | null;
  listSpace: Space[];
}
interface FieldCreateRequest extends Pick<Field, "id" | "name" | "code"> {}

const emptyField: Field = {
  id: 0, // ID giả để phân biệt với các field thật
  name: null,
  code: "",
  status: 1,
  createdAt: null,
  updatedAt: null,
  listSpace: [],
};

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
    if (fields.length > 0) {
      setSearchData(fields); // Chỉ cập nhật khi users có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải

    // Cập nhật selectedField theo data mới nhất.
    if (selectedField) {
      const updated = fields.find((f) => f.id === selectedField.id);
      if (updated) {
        const listSpace = spaces.filter((s) => s.fieldId === updated.id);
        setSelectedField({ ...updated, listSpace });
      }
    }
  }, [fields, spaces]);

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
  /**
   * Chỉnh sửa lĩnh vực
   */

  const [isEditing, setIsEditing] = useState(false);

  const [statusField, setStatusField] = useState(
    (selectedField?.status ?? 0) > 0 ? true : false
  );

  /**
   * Chỉnh sửa tên cho lĩnh vực
   */

  const handleEditInput = () => {
    if (!isEditing) setIsEditing(true);
  };

  /**
   * Xử lý phần chỉnh sửa tên cho lĩnh vực.
   */
  const handleRename = async (req: FieldCreateRequest) => {
    try {
      const nameCheck = validateName(req.name);
      if (!nameCheck.valid) {
        setError(nameCheck.error);
        return;
      }

      let response;

      if (req.id === 0) {
        response = await axios.post(
          "http://localhost:8080/api/admin/field/create",
          req
        );
        setSelectedField(emptyField);
        setInputFieldName("");
        setFieldCode("");
      } else {
        response = await axios.post(
          "http://localhost:8080/api/admin/field/changeName",
          req
        );
      }

      /**
       * Xử lý sau khi có api trả về:
       * + dispatch vào redux cho đồng bộ
       */

      if (response.data.statusCode === 1000 || response.status === 200) {
        dispatch(fetchFields());
        setError("");
      } else {
        setError(response.data.message || "Lỗi không xác định");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
    setIsEditing(false);
  };

  useEffect(() => {
    setStatusField((selectedField?.status ?? 0) > 0);
    setInputFieldName(selectedField?.name || "");
    setFieldCode(selectedField?.code || "");
    setIsEditing(false);
    setError("");
  }, [selectedField]);

  const [inputFieldName, setInputFieldName] = useState<string | null>(
    selectedField?.name || null
  );

  /**
   * Validate cho input name.
   */
  const [fieldCode, setFieldCode] = useState(selectedField?.code);

  const fieldCodeList = fields.map((field) => field.code);

  const handleChangeFieldName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const fieldCodeNew = RemoveVietnameseTones(value);

    if (fieldCodeList.includes(fieldCodeNew)) {
      setError("Tên đã tồn tại, vui lòng chọn tên mới !");
    } else {
      setError("");
    }
    setInputFieldName(value);
    setFieldCode(fieldCodeNew);
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

          <button
            className={`${styles.field_add} ${styles.field_box}`}
            onClick={() => {
              setSelectedField(emptyField);
            }}
          >
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
      </div>

      {selectedField && (
        <div className={styles.field_edit_by_id}>
          <IoIosCloseCircle
            className={styles.close_btn}
            onClick={() => setSelectedField(null)}
          />
          <div className={styles.field_item}>
            <FieldCard
              field={{ ...selectedField, name: selectedField.name ?? "" }}
            />
          </div>

          <div className={styles.field_edit_content}>
            <p className={styles.field_edit_label}>Thông tin</p>

            <div className={`${styles.field_information_item} `}>
              <span>Danh sách không gian:</span>
              <span className={styles.field_space_list}>
                {" "}
                {selectedField.listSpace.length}
              </span>

              {selectedField.listSpace.length > 0 ? (
                <TfiNewWindow className={styles.field_navigation_list_space} />
              ) : (
                selectedField.id > 0 && (
                  <a className={styles.field_navigation_add_space}>
                    Thêm không gian mới
                  </a>
                )
              )}
            </div>
            <div className={`${styles.field_information_item} `}>
              <span>Trạng thái: </span>
              <StatusToggle
                id={selectedField.id}
                status={selectedField.status}
                apiUrl="http://localhost:8080/api/admin/field/changeStatus"
              />
            </div>

            <div className={`${styles.field_information_item} `}>
              <span>Tên lĩnh vực : </span>

              <div className={styles.field_input_name_container}>
                <input
                  type="text"
                  id="input"
                  required
                  readOnly={!isEditing}
                  value={inputFieldName ?? ""}
                  onChange={handleChangeFieldName}
                />

                {!isEditing ? (
                  <RiEdit2Line
                    className={styles.field_input_name_edit}
                    onClick={handleEditInput}
                  />
                ) : error ? (
                  <IoIosWarning className={styles.field_input_name_warning} />
                ) : (
                  <FaSave
                    className={styles.field_input_name_edit}
                    onClick={() => {
                      selectedField.id !== 0 &&
                        handleRename({
                          id: selectedField.id,
                          name: inputFieldName ?? "",
                          code: fieldCode ?? "",
                        });
                    }}
                  />
                )}

                <div className={styles.underline}></div>
              </div>
              {error && (
                <p className={styles.field_input_name_error}>{error}</p>
              )}
            </div>

            <div className={`${styles.field_information_item} `}>
              <span>Mã lĩnh vực: </span>
              <span className={styles.field_code}>{fieldCode}</span>
            </div>

            <div className={`${styles.field_information_item} `}>
              <span>Ngày khởi tạo: </span>
              <span className={styles.field_space_list}>
                {selectedField.createdAt === null
                  ? "Chưa có"
                  : format(
                      new Date(selectedField.createdAt),
                      "dd/MM/yyyy HH:mm"
                    )}
              </span>
            </div>

            <div className={`${styles.field_information_item} `}>
              <span>Cập nhật gần nhất: </span>
              <span className={styles.field_space_list}>
                {selectedField.updatedAt === null
                  ? "Chưa có"
                  : format(
                      new Date(selectedField.updatedAt),
                      "dd/MM/yyyy HH:mm"
                    )}
              </span>
            </div>
          </div>

          <div className={styles.field_footer}>
            {selectedField.id > 0 ? (
              <button className={styles.field_delete_change_btn}>
                {" "}
                Xoá lĩnh vực{" "}
              </button>
            ) : (
              <button
                className={styles.field_add_change_btn}
                disabled={!!error}
                onClick={() =>
                  handleRename({
                    id: selectedField.id,
                    name: inputFieldName ?? "",
                    code: fieldCode ?? "",
                  })
                }
              >
                {" "}
                Hoàn tất{" "}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Field;
