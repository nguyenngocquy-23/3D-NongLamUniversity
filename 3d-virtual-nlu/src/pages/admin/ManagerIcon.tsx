import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/user.module.css";
import stylesCommon from "../../styles/common/navigateBar.module.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchIcons, fetchUsers } from "../../redux/slices/DataSlice";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import { API_URLS } from "../../env";
import { useDebounce } from "../../hooks/useDebounce";
import { format } from "date-fns";
import { FaSave } from "react-icons/fa";
import { IoMdExit, IoIosWarning } from "react-icons/io";
import { RiEdit2Line } from "react-icons/ri";
import { TfiNewWindow } from "react-icons/tfi";
import SpaceCard from "../../components/admin/SpaceCard";
import StatusToggle from "../../components/admin/ToggleChangeStatus";
import { goToStep } from "../../redux/slices/StepSlice";
import { RemoveVietnameseTones } from "../../utils/RemoveVietnameseTones";
import { validateName } from "../../utils/ValidateInputName";

interface Icon {
  id: number;
  name: string;
  code: string;
  url: string;
  type: number;
  thumbnail: string;
  isActive: number;
  createdAt: number | null;
}

const emptyIcon: Icon = {
  id: 0,
  name: "",
  code: "",
  type: 1,
  url: "",
  thumbnail: "",
  isActive: 1,
  createdAt: null,
};

const ManagerIcon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [type, setType] = useState(1);
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const icons = useSelector((state: RootState) => state.data.icons) || [];
  const [inputIconName, setInputIconName] = useState<string | null>(
    selectedIcon?.name || null
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setInputIconName(selectedIcon?.name || "");
    setNameCode(selectedIcon?.code || "");
  }, [selectedIcon]);

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

  const dashboard = useSelector((state: RootState) => state.data.dashboard);
  const [nameCode, setNameCode] = useState(selectedIcon?.code);
  const [iconList, setIconList] = useState<any[]>(icons || []);
  const [isEditing, setIsEditing] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // custom hook

  const iconCodeList = icons.map((icon) => icon.code);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) return;
      const response = await axios.post(`${API_URLS.SEARCH_ICONS}`, {
        searchKey: debouncedSearch,
      });
      setIconList(response.data.data);
    };
    handleSearch();
  }, [debouncedSearch]);

  useEffect(() => {
    if (icons && icons.length > 0) {
      setIconList(icons);
    }
  }, [icons]);

  useEffect(() => {
    if (search === "") {
      setIconList(icons);
    }
  }, [search]);

  const handleEditInput = () => {
    if (!isEditing) setIsEditing(true);
  };

  const handleChangeIconName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const iconCodeNew = RemoveVietnameseTones(value);
    if (iconCodeList.includes(iconCodeNew)) {
      setError("Tên đã tồn tại, vui lòng chọn tên mới !");
    } else {
      setError("");
    }
    setInputIconName(value);
    setNameCode(iconCodeNew);
  };

  const handleRename = async (req: Icon) => {
    try {
      const nameCheck = validateName(req.name);

      if (!nameCheck.valid) {
        setError(nameCheck.error);
        return;
      }

      let response;

      if (req.id === 0) {
        response = await axios.post(API_URLS.ADMIN_CREATE_SPACES, req);
        setInputIconName("");
        setNameCode("");
      } else {
        response = await axios.post(API_URLS.ADMIN_CHANGE_NAME_SPACE, req);
      }

      /**
       * Xử lý sau khi có api trả về:
       * + dispatch vào redux cho đồng bộ
       */
      if (response.data.statusCode === 1000 || response.status === 200) {
        dispatch(fetchIcons());
        setError("");
      } else {
        setError(response.data.message || "Lỗi không xác định");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
    setIsEditing(false);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={styles.add_icon}
            onClick={() => {
              setSelectedIcon(emptyIcon);
            }}
          >
            Tạo biểu tượng
          </button>
        </div>
        <div className={styles.type_icon}>
          <button
            className={`${styles.type} ${type == 1 ? styles.active : ""}`}
            onClick={() => setType(1)}
          >
            2D
          </button>
          <button
            className={`${styles.type} ${type == 2 ? styles.active : ""}`}
            onClick={() => setType(2)}
          >
            3D
          </button>
        </div>
        <div className={styles.icon_list}>
          {iconList.filter((i) => i.type == type).map((icon) => {
            return (
              <div
                key={icon.id}
                className={`${styles.icon_item} ${icon.id == selectedIcon?.id ? styles.selected : ""}`}
                title={icon.name}
                onClick={() => setSelectedIcon(icon)}
              >
                <img
                  src={!icon.url.includes("glb") ? icon.url : icon.thumbnail}
                  alt={icon.name}
                  className={styles.icon_image}
                />
                <div className={`${styles.icon_status} ${icon.isActive ? styles.status_active : ""}`}/>
                <div className={styles.icon_info}>
                  <h3>{icon.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedIcon && (
        <div className={styles.icon_edit_by_id}>
          <IoMdExit
            className={styles.close_btn}
            onClick={() => setSelectedIcon(null)}
          />
          <div
            className={styles.icon_card}
            style={{
              backgroundImage: `url(${
                selectedIcon.url.includes("glb")
                  ? selectedIcon.thumbnail
                  : selectedIcon.url
              })`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />

          <div className={styles.icon_edit_content}>
            <p className={styles.icon_edit_label}>Thông tin</p>
            <div className={`${styles.icon_information_item} `}>
              <span>Trạng thái: </span>
              <StatusToggle
                id={selectedIcon.id}
                status={selectedIcon.isActive}
                apiUrl={API_URLS.ADMIN_CHANGE_ICON_STATUS}
                type="icon"
              />
            </div>
            <div className={`${styles.icon_information_item} `}>
              <span>Loại: {selectedIcon.type == 1 ? "2D" : "3D"}</span>
            </div>
            <div className={`${styles.icon_information_item} `}>
              <span>Tên biểu tượng : </span>

              <div className={styles.icon_input_name_container}>
                <input
                  type="text"
                  id="input"
                  required
                  readOnly={!isEditing}
                  value={inputIconName ?? ""}
                  onChange={handleChangeIconName}
                />

                {!isEditing ? (
                  <RiEdit2Line
                    className={styles.icon_input_name_edit}
                    onClick={handleEditInput}
                  />
                ) : error ? (
                  <IoIosWarning className={styles.icon_input_name_warning} />
                ) : (
                  <FaSave
                    className={styles.icon_input_name_edit}
                    // onClick={() => {
                    //   selectedIcon.id !== 0 &&
                    //     handleRename({
                    //       id: selectedIcon.id,
                    //       name: inputIconName ?? "",
                    //       code: nameCode ?? "",
                    //     });
                    // }}
                  />
                )}

                <div className={styles.underline}></div>
              </div>
              {error && <p className={styles.icon_input_name_error}>{error}</p>}
            </div>

            <div className={`${styles.icon_information_item} `}>
              <span>Mã biểu tượng: </span>
              <span className={styles.icon_code}>{nameCode}</span>
            </div>
            <div className={`${styles.icon_information_item} `}>
              <span>Ngày khởi tạo: </span>
              <span>
                {selectedIcon.createdAt === null
                  ? "Chưa có"
                  : format(
                      new Date(selectedIcon.createdAt),
                      "dd/MM/yyyy HH:mm"
                    )}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagerIcon;
