import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/user.module.css";
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
import StatusToggle from "../../components/admin/ToggleChangeStatus";
import { RemoveVietnameseTones } from "../../utils/RemoveVietnameseTones";
import { validateName } from "../../utils/ValidateInputName";
import Swal from "sweetalert2";
import UploadFile from "../../components/admin/UploadFile";
import Icon3DPreviewWithSnapshot from "../../components/admin/PreviewIcon3DWithSnapshot";

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

const emptyIcon: any = {
  name: "",
  code: "",
  type: 1,
  url: "",
  thumbnail: "",
};

const ManagerIcon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [type, setType] = useState(1);
  const [typeCreate, setTypeCreate] = useState(1);
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const icons = useSelector((state: RootState) => state.data.icons) || [];
  const [inputIconName, setInputIconName] = useState<string | null>(
    selectedIcon?.name || null
  );
  const [modelUrl, setModelUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [changeThumbnailUrl, setChangeThumbnailUrl] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setInputIconName(selectedIcon?.name || "");
    setNameCode(selectedIcon?.code || "");
    setModelUrl(selectedIcon?.url || "");
    setThumbnailUrl(selectedIcon?.thumbnail || "");
    setIsEditing(false);
    setError("");
    setChangeThumbnailUrl(false);
  }, [selectedIcon]);

  useEffect(() => {
    if (thumbnailUrl != selectedIcon?.thumbnail) setChangeThumbnailUrl(true);
  }, [thumbnailUrl]);

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
  const [canHandle, setCanHandle] = useState(false);

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

  /**
   * kiểm tra điều kiện để có thể thực hiện thao tác lưu
   * nếu là tạo mới biểu tượng 2D thì chỉ cần tên và modelUrl
   * nếu là tạo mới biểu tượng 3D thì cần tên, modelUrl và thumbnailUrl
   */
  useEffect(() => {
    if (
      typeCreate == 2 &&
      inputIconName &&
      modelUrl !== "" &&
      thumbnailUrl !== ""
    ) {
      setCanHandle(true);
    } else if (typeCreate == 1 && inputIconName && modelUrl) {
      setCanHandle(true);
    } else {
      setCanHandle(false);
    }
  }, [inputIconName, modelUrl, thumbnailUrl]);

  useEffect(() => {
    handleUploadedFile("");
    handleThumbnailSaved("");
    setType(typeCreate);
  }, [typeCreate]);

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

  const handleRename = async (req: any) => {
    console.log("handleRename", req);
    try {
      const nameCheck = validateName(req.name);

      if (!nameCheck.valid) {
        setError(nameCheck.error);
        return;
      }

      if (iconCodeList.includes(req.code)) {
        setError("Tên đã tồn tại. Vui lòng chọn tên mới để cập nhật !");
        return;
      }

      let response;

      if (req.id === 0 || req.id == undefined) {
        const { iconId, ...reqWithoutId } = req;
        response = await axios.post(API_URLS.ADMIN_CREATE_ICONS, reqWithoutId);
      } else {
        response = await axios.post(API_URLS.ADMIN_CHANGE_NAME_ICON, req);
      }

      /**
       * Xử lý sau khi có api trả về:
       * + dispatch vào redux cho đồng bộ
       */
      if (response.data.statusCode === 1000 || response.status === 200) {
        if (req.id === 0 || req.id == undefined) {
          Swal.fire({
            title: "Tạo biểu tượng thành công",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            position: "top-end",
            toast: true,
            timerProgressBar: true,
          });
          setSelectedIcon(null);
          setInputIconName("");
          setNameCode("");
          setModelUrl("");
        } else {
          Swal.fire({
            title: "Đổi tên thành công",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            position: "top-end",
            toast: true,
            timerProgressBar: true,
          });
          setInputIconName(req.name);
          setNameCode(req.code);
        }
        dispatch(fetchIcons());
        setError("");
      } else {
        if (req.id === 0 || req.id == undefined) {
          Swal.fire({
            title: "Lỗi khi tạo biểu tượng",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
            position: "top-end",
            toast: true,
            timerProgressBar: true,
          });
          return;
        } else {
          Swal.fire({
            title: "Đổi tên thất bại",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
            position: "top-end",
            toast: true,
            timerProgressBar: true,
          });
          return;
        }
      }
    } catch (err: any) {
      Swal.fire({
        title: "Lỗi khi thao tác",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        position: "top-end",
        toast: true,
        timerProgressBar: true,
      });
    }
    setIsEditing(false);
  };

  const handleChangeThumbnail = async (req: any) => {
    try {
      const response = await axios.post(API_URLS.ADMIN_CHANGE_THUMBNAIL_ICONS, req);

      if (response.data.data) {
        Swal.fire({
          title: "cập nhật thành công",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          position: "top-end",
          toast: true,
          timerProgressBar: true,
        });
        setSelectedIcon(null);
        dispatch(fetchIcons());
        setError("");
      } else {
        Swal.fire({
          title: "Cập nhật thất bại",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          position: "top-end",
          toast: true,
          timerProgressBar: true,
        });
        return;
      }
    } catch (err: any) {
      Swal.fire({
        title: "Cập nhật thất bại",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        position: "top-end",
        toast: true,
        timerProgressBar: true,
      });
    }
    setIsEditing(false);
  };

  const handleUploadedFile = (url: string) => {
    setModelUrl(url);
  };
  const handleThumbnailSaved = (url: string) => {
    setThumbnailUrl(url);
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
          {iconList
            .filter((i) => i.type == type)
            .map((icon) => {
              return (
                <div
                  key={icon.id}
                  className={`${styles.icon_item} ${
                    icon.id == selectedIcon?.id ? styles.selected : ""
                  }`}
                  title={icon.name}
                  onClick={() => setSelectedIcon(icon)}
                >
                  <img
                    src={!icon.url.includes("glb") ? icon.url : icon.thumbnail}
                    alt={icon.name}
                    className={styles.icon_image}
                  />
                  <div
                    className={`${styles.icon_status} ${
                      icon.isActive ? styles.status_active : ""
                    }`}
                  />
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
          {selectedIcon.id != undefined && selectedIcon.id != null ? (
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
          ) : typeCreate == 1 ? (
            <div className={styles.upload_icon_card}>
              <UploadFile
                key={typeCreate === 1 ? "upload-icon" : "upload-model"}
                className="upload_icon"
                onUploaded={handleUploadedFile}
              />
            </div>
          ) : (
            <div className={styles.upload_icon_card}>
              <UploadFile
                key={typeCreate === 1 ? "upload-icon" : "upload-model"}
                className="upload_model"
                onUploaded={handleUploadedFile}
              />
            </div>
          )}

          {((typeCreate === 2 && modelUrl && selectedIcon.thumbnail == "") ||
            (modelUrl && selectedIcon.thumbnail)) && (
            <>
              <Icon3DPreviewWithSnapshot
                key={selectedIcon.id || "null"}
                modelUrl={modelUrl}
                onThumbnailSaved={handleThumbnailSaved}
              />
              <i style={{ margin: "0 auto", fontSize: "12px" }}>
                Dùng{" "}
                <img
                  style={{ width: "40px", verticalAlign: "middle" }}
                  src={`${import.meta.env.BASE_URL}key_move.png`}
                  alt="Arrow keys"
                />
                để di chuyển mô hình
              </i>
            </>
          )}

          <div className={styles.icon_edit_content}>
            {/* <p className={styles.icon_edit_label}>Thông tin</p> */}
            {selectedIcon.id != undefined && selectedIcon.id != null && (
              <div className={`${styles.icon_information_item} `}>
                <span>Trạng thái: </span>
                <StatusToggle
                  id={selectedIcon.id}
                  status={selectedIcon.isActive}
                  apiUrl={API_URLS.ADMIN_CHANGE_ICON_STATUS}
                  type="icon"
                  editable={true}
                />
              </div>
            )}
            <div className={`${styles.icon_information_item} `}>
              {selectedIcon.id != undefined && selectedIcon.id != null ? (
                <span>Loại: {selectedIcon.type == 1 ? "2D" : "3D"}</span>
              ) : (
                <>
                  <span>Loại:</span>
                  <select
                    className={styles.custom_select}
                    value={typeCreate}
                    onChange={(e) => setTypeCreate(Number(e.target.value))}
                  >
                    <option value="1">2D</option>
                    <option value="2">3D</option>
                  </select>
                </>
              )}
            </div>
            <div className={`${styles.icon_information_item} `}>
              <span>Tên biểu tượng : </span>

              <div className={styles.icon_input_name_container}>
                {selectedIcon.id != undefined && selectedIcon.id != null ? (
                  <input
                    type="text"
                    id="input"
                    required
                    readOnly={!isEditing}
                    value={inputIconName ?? ""}
                    onChange={handleChangeIconName}
                  />
                ) : (
                  <input
                    type="text"
                    id="input"
                    required
                    readOnly={selectedIcon.id !== undefined}
                    value={inputIconName ?? ""}
                    onChange={handleChangeIconName}
                  />
                )}

                {!isEditing ? (
                  <RiEdit2Line
                    className={styles.icon_input_name_edit}
                    onClick={handleEditInput}
                    visibility={
                      selectedIcon.id !== undefined ? "visible" : "hidden"
                    }
                  />
                ) : error ? (
                  <IoIosWarning className={styles.icon_input_name_warning} />
                ) : (
                  <FaSave
                    className={styles.icon_input_name_edit}
                    onClick={() => {
                      selectedIcon.id !== 0 &&
                        handleRename({
                          id: selectedIcon.id,
                          name: inputIconName?.trim() ?? "",
                          code: nameCode?.trim() ?? "",
                        });
                    }}
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
            {selectedIcon.id != undefined && selectedIcon.id != null && (
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
            )}
          </div>
          {selectedIcon.id == undefined && selectedIcon.id == null && (
            <div className={styles.icon_footer}>
              <button
                className={`${styles.icon_add_change_btn} ${
                  canHandle ? "" : styles.cant_handle
                }`}
                disabled={!!error}
                onClick={() =>
                  handleRename({
                    iconId: selectedIcon.id,
                    name: inputIconName ?? "",
                    code: nameCode ?? "",
                    iconUrl: modelUrl,
                    thumbnail: thumbnailUrl,
                    type: typeCreate,
                  })
                }
              >
                Hoàn tất
              </button>
            </div>
          )}
          {selectedIcon.thumbnail && (
            <div className={styles.icon_footer}>
              <button
                className={`${styles.icon_add_change_btn} ${
                  changeThumbnailUrl ? "" : styles.cant_handle
                }`}
                disabled={!!error}
                onClick={() =>
                  handleChangeThumbnail({
                    id: selectedIcon.id,
                    thumbnail: thumbnailUrl,
                  })
                }
              >
                Cập nhật
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ManagerIcon;
