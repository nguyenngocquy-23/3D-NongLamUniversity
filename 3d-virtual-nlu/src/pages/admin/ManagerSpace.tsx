import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/managerSpace.module.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import StatusToggle from "../../components/admin/ToggleChangeStatus";
import { IoSearch } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { TiFilter } from "react-icons/ti";
import { FaSave, FaSortAmountDown } from "react-icons/fa";
import SpaceCard from "../../components/admin/SpaceCard";
import { IoIosCloseCircle, IoIosWarning, IoMdExit } from "react-icons/io";
import { RiEdit2Line } from "react-icons/ri";
import { format } from "date-fns";
import { RemoveVietnameseTones } from "../../utils/RemoveVietnameseTones";
import axios from "axios";
import { validateName } from "../../utils/ValidateInputName";
import { fetchSpaces } from "../../redux/slices/DataSlice";
import { GrConfigure } from "react-icons/gr";
import { FiMapPin } from "react-icons/fi";

interface Space {
  id: number;
  url: string;
  fieldName: string;
  code: string;
  masterNodeId: number | null;
  masterNodeName: string | null;
  name: string | null;
  description: string;
  status: number;
  createdAt: number | null;
  updatedAt: number | null;
  tourIds: number[] | null;
}
interface SpaceCreateRequest extends Pick<Space, "id" | "name" | "code"> {}
const emptySpace: Space = {
  id: 0, // ID giả để phân biệt với các field thật
  name: null,
  code: "",
  url: "",
  fieldName: "",
  masterNodeId: null,
  masterNodeName: null,
  description: "",
  status: 1,
  createdAt: null,
  updatedAt: null,
  tourIds: null,
};

const Space = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const fields = useSelector((state: RootState) => state.data.fields) || [];
  const spaces = useSelector((state: RootState) => state.data.spaces) || [];
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

  const [searchData, setSearchData] = useState<Space[]>([]);
  const [openModel, setOpenModel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fieldCode, setFieldCode] = useState(selectedSpace?.code);
  const dispatch = useDispatch<AppDispatch>();
  const spaceCodeList = spaces.map((space) => space.code);
  const handleEditInput = () => {
    if (!isEditing) setIsEditing(true);
  };

  useEffect(() => {
    setInputFieldName(selectedSpace?.name || "");
    setFieldCode(selectedSpace?.code || "");
    setIsEditing(false);
    setError("");
  }, [selectedSpace]);

  const [inputFieldName, setInputFieldName] = useState<string | null>(
    selectedSpace?.name || null
  );

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

  const handleChangeFieldName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const spaceCodeNew = RemoveVietnameseTones(value);

    if (spaceCodeList.includes(spaceCodeNew)) {
      setError("Tên đã tồn tại, vui lòng chọn tên mới !");
    } else {
      setError("");
    }
    setInputFieldName(value);
    setFieldCode(spaceCodeNew);
  };

  /**
   * Xử lý phần chỉnh sửa tên cho lĩnh vực.
   */
  const handleRename = async (req: SpaceCreateRequest) => {
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
        setSelectedSpace(emptySpace);
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
        dispatch(fetchSpaces());
        setError("");
      } else {
        setError(response.data.message || "Lỗi không xác định");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
    setIsEditing(false);
  };

  const [isChecked, setIsChecked] = useState(false); // mặc định chưa chọn

  const handleCheckboxChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const checked = event.target.checked;

    if (!event.target.checked) {
      // Ngăn không cho bỏ chọn
      event.preventDefault();
      return;
    }
    setIsChecked(checked);

    // Nếu chọn -> gọi API
    try {
      await axios.post("http://localhost:8080/api/admin/space/setMasterSpace", {
        id,
        status: 2,
      });
      console.log("Cập nhật thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };

  const handleSelect = async (spaceId: number, masterNodeId: number) => {
    if (!masterNodeId || masterNodeId === 0) return;

    try {
      const payload = {
        id: spaceId,
        masterNodeId: masterNodeId,
      };

      const response = await axios.post(
        "http://localhost:8080/api/admin/space/setMasterNodeById",
        payload
      );

      console.log("Cập nhật thành công:", response.data.message);
      // Thêm toast hoặc cập nhật UI nếu cần
    } catch (error) {
      console.error("Lỗi khi cập nhật master node:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.space_view_mode}>
        <button className={styles.space_switch_view_btn}>Dạng lưới</button>
        <button className={styles.space_switch_view_btn}>Dạng bản đồ</button>
      </div>

      <hr className={styles.break} />
      <div className={styles.space_main_content}>
        <div className={styles.space_list_content}>
          <div className={styles.space_features}>
            <div className={`${styles.space_search_box} ${styles.space_box}`}>
              <input
                type="text"
                name="field"
                id="input"
                placeholder="Tìm kiếm không gian..."
                className={styles.space_search_input}
              />
              <label htmlFor="input" className={styles.label_for_search}>
                <IoSearch className={styles.search_icon} />
              </label>
              <div className={styles.border}></div>
              <button className={styles.mic_search}>
                <FaMicrophone className={styles.mic_icon} />
              </button>
            </div>

            <div className={`${styles.space_filter_box} ${styles.space_box}`}>
              <TiFilter className={styles.filter_icon} />
              <button className={styles.filter_popup}>Lọc</button>
            </div>

            <div className={`${styles.space_sort_box} ${styles.space_box}`}>
              <FaSortAmountDown className={styles.sort_icon} />
              <button className={styles.filter_popup}>Tên</button>
            </div>

            <button
              className={`${styles.space_add} ${styles.space_box}`}
              onClick={() => {}}
            >
              Thêm không gian
            </button>
          </div>
          <hr className={styles.space_break} />

          <div className={styles.space_quantity}>
            Kết quả: {spaces.length} không gian.
          </div>

          <div className={styles.space_list}>
            {spaces.map((space) => {
              return (
                <div
                  key={space.id}
                  className={styles.space_item}
                  onClick={() => setSelectedSpace(space)}
                >
                  <SpaceCard space={space} />
                </div>
              );
            })}
          </div>
        </div>
        {/* Chỉnh sửa thông tin chung */}
        {selectedSpace && (
          <div className={styles.space_edit_by_id}>
            <IoMdExit
              className={styles.close_btn}
              onClick={() => setSelectedSpace(null)}
            />
            <div className={styles.space_item}>
              <SpaceCard
                space={{ ...selectedSpace, name: selectedSpace.name ?? "" }}
              />
              <div className={styles.space_feautures_inner}>
                <span className={styles.space_feature_inner_item}>
                  <RiEdit2Line /> Ảnh đại diện.
                </span>
                <Link
                  to={`./${selectedSpace.id}`}
                  className={styles.space_feature_inner_item}
                >
                  <GrConfigure /> Không gian con.
                </Link>

                <span className={styles.space_feature_inner_item}>
                  <FiMapPin /> Gắn nhãn bản đồ.
                </span>
              </div>
            </div>

            <div className={styles.space_edit_content}>
              <p className={styles.space_edit_label}>Thông tin</p>

              <div className={styles.space_choose_master}>
                <span>Trung tâm:</span>
                <select
                  className={styles.custom_select}
                  onChange={(e) =>
                    handleSelect(selectedSpace.id, parseInt(e.target.value, 10))
                  }

                  // onChange={handleSelectSpace}
                >
                  <option value="0">-- Chọn tour --</option>
                  {selectedSpace.tourIds &&
                    selectedSpace.tourIds.map((tourId) => (
                      <option key={tourId} value={tourId}>
                        Tour {tourId}
                      </option>
                    ))}
                </select>
              </div>
              <div className={`${styles.space_information_item} `}>
                <span>Trạng thái: </span>
                <StatusToggle
                  id={selectedSpace.id}
                  status={selectedSpace.status}
                  apiUrl="http://localhost:8080/api/admin/space/changeStatus"
                />
              </div>

              <div className={`${styles.space_information_item} `}>
                <span>Tên lĩnh vực : </span>

                <div className={styles.space_input_name_container}>
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
                      className={styles.space_input_name_edit}
                      onClick={handleEditInput}
                    />
                  ) : error ? (
                    <IoIosWarning className={styles.space_input_name_warning} />
                  ) : (
                    <FaSave
                      className={styles.space_input_name_edit}
                      onClick={() => {
                        selectedSpace.id !== 0 &&
                          handleRename({
                            id: selectedSpace.id,
                            name: inputFieldName ?? "",
                            code: fieldCode ?? "",
                          });
                      }}
                    />
                  )}

                  <div className={styles.underline}></div>
                </div>
                {error && (
                  <p className={styles.space_input_name_error}>{error}</p>
                )}
              </div>

              <div className={`${styles.space_information_item} `}>
                <span>Mã lĩnh vực: </span>
                <span className={styles.space_code}>{fieldCode}</span>
              </div>

              <div className={`${styles.space_information_item} `}>
                <span>Ngày khởi tạo: </span>
                <span className={styles.space_space_list}>
                  {selectedSpace.createdAt === null
                    ? "Chưa có"
                    : format(
                        new Date(selectedSpace.createdAt),
                        "dd/MM/yyyy HH:mm"
                      )}
                </span>
              </div>

              <div className={`${styles.space_information_item} `}>
                <span>Cập nhật gần nhất: </span>
                <span className={styles.space_node_list}>
                  {selectedSpace.updatedAt === null
                    ? "Chưa có"
                    : format(
                        new Date(selectedSpace.updatedAt),
                        "dd/MM/yyyy HH:mm"
                      )}
                </span>
              </div>

              <div className={styles.space_select_master}>
                <span>Chọn làm không gian chính: </span>
                <label className={styles.check_container}>
                  <input
                    checked={isChecked}
                    type="checkbox"
                    onChange={(event) =>
                      handleCheckboxChange(event, selectedSpace.id)
                    }
                  />
                  <div className={styles.checkmark}></div>
                </label>
              </div>
            </div>

            <div className={styles.space_footer}>
              {selectedSpace.id > 0 ? (
                <button className={styles.space_delete_change_btn}>
                  {" "}
                  Xoá không gian{" "}
                </button>
              ) : (
                <button
                  className={styles.space_add_change_btn}
                  disabled={!!error}
                  onClick={() =>
                    handleRename({
                      id: selectedSpace.id,
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
      </div>
    </div>
  );
};

export default Space;
