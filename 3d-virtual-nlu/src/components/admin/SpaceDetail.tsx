import { ChangeEvent, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/spaceDetail.module.css";
import stylesLoading from "../../styles/minimap.module.css";
import { IoChevronBack } from "react-icons/io5";
import axios, { AxiosError } from "axios";
import { API_URLS } from "../../env";
import {
  isInteger,
  TourNodeRequestMapper,
} from "../../utils/TourNodeRequestMapper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import {
  addPanoramasFromResponse,
  clearPanorama,
  selectPanorama,
  setPanoramas,
} from "../../redux/slices/PanoramaSlice";
import {
  addHotspotPosition,
  addHotspotsFromResponse,
  addNavigationHotspot,
  BaseHotspot,
  clearHotspot,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice";
import UpdateHotspot from "./taskCreateTourList/UpdateHotspot";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import RightMenuCreateTour from "./RightMenuCT";
import TaskContainerCT from "./TaskContainerCT";
import {
  DEFAULT_ORIGINAL_Z,
  MAX_DESCRIPTION,
  RADIUS_SPHERE,
} from "../../utils/Constants";
import { Environment } from "@react-three/drei";
import UpdateCameraOnResize from "../UpdateCameraOnResize";
import TourScene from "../visitor/TourScene";
import GroundHotspot from "../visitor/GroundHotspot";
import GroundHotspotInfo from "../visitor/GroundHotspotInfo";
import GroundHotspotModel from "../visitor/GroundHotspotModel";
import VideoMeshComponent from "./VideoMesh";
import { useSequentialTasks } from "../../hooks/useSequentialTasks";
import Task2 from "./taskCreateTourList/Task2BasicConfig";
import Task3 from "./taskCreateTourList/Task3AddHotspot";
import Swal from "sweetalert2";
import { goToStep } from "../../redux/slices/StepSlice";
import gsap from "gsap";
import TrackingSpace from "../TrackingSpace";
import CamControls from "../visitor/CamControls";
import { CiEdit, CiSquareChevDown } from "react-icons/ci";
import StatusToggle from "./ToggleChangeStatus";
import { TiEdit } from "react-icons/ti";
import { FaSave } from "react-icons/fa";
import Field from "../../pages/admin/ManagerField";
import {
  ApiResponse,
  CloudinaryUploadResp,
  FileUploadStatus,
} from "./UploadFile";
import Space from "../../pages/admin/ManagerSpace";
import { RemoveVietnameseTones } from "../../utils/RemoveVietnameseTones";
import {
  getFilteredHotspotInformationInList,
  getFilteredHotspotMediaInList,
  getFilteredHotspotModelInList,
  getFilteredHotspotNavigationInList,
} from "../../redux/slices/Selectors";
import { AnimatePresence, motion } from "framer-motion";
import { IoMdMenu } from "react-icons/io";
const SpaceDetail = () => {
  const navigate = useNavigate();

  const { spaceId } = useParams(); //Id từ url

  const dispatch = useDispatch<AppDispatch>();

  const inputImageRef = useRef<HTMLInputElement>(null);

  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [fields, setFields] = useState<Field[] | null>([]);

  useEffect(() => {
    dispatch(goToStep(4)); //
  }, [dispatch]);

  //=== LẤY DANH SÁCH CÁC TOUR CÓ TRONG 1 SPACE => REDUX.
  useEffect(() => {
    if (!spaceId) return;

    axios
      .post(API_URLS.ADMIN_GET_MASTER_NODES_OF_SPACE, {
        spaceId: Number(spaceId),
      })
      .then((res) => {
        const nodes = res.data.data;

        dispatch(clearPanorama());
        dispatch(clearHotspot());
        const { panoramaList, hotspotList } =
          TourNodeRequestMapper.mapToPanoramaAndHotspots(nodes);

        dispatch(addPanoramasFromResponse(panoramaList));
        dispatch(addHotspotsFromResponse(hotspotList));
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách node:", err);
      });
  }, [spaceId, dispatch]);

  const reduxSpace = useSelector((state: RootState) => {
    return state.data.spaces.find((s) => s.id === Number(spaceId));
  });

  useEffect(() => {
    if (!spaceId) return;

    if (reduxSpace) {
      setCurrentSpace(reduxSpace);
    } else {
      axios
        .post(API_URLS.ADMIN_GET_SPACE_BY_ID, {
          spaceId: Number(spaceId),
        })
        .then((response) => {
          setCurrentSpace(response.data.data);
        })
        .catch((err) => {
          console.error("Lỗi khi tải thông tin không gian !", err);
        });
    }
  }, [spaceId, reduxSpace]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get<ApiResponse<Field[]>>(
          `${API_URLS.GET_ALL_FIELDS}`
        );

        if (response.data.statusCode === 1000) {
          setFields(response.data.data);
        } else {
          console.log("Lỗi khi lấy danh sách fields", response.data.message);
        }
      } catch (error) {
        console.warn("Lỗi khi gọi API", error);
      }
    };

    fetchFields();
  }, []);

  // ======= Xử lý trong trang tổng quan ============
  /**
   * currentSpace: Version chính gốc.
   *  originalSpace: Version ngay trước khi "click chỉnh sửa".
   * editedSpace: Version chỉnh sửa => dùng đối chiếu để lưu về database.
   * */

  const [originalSpace, setOriginalSpace] = useState<Space | null>(null);
  const [editedSpace, setEditedSpace] = useState<Space | null>(null);

  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus | null>(
    null
  );

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    setFileStatuses({
      file: newFile,
      status: "uploading",
    });

    await handleUpload(newFile);
  };

  const handleUpload = async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resp = await axios.post<ApiResponse<CloudinaryUploadResp>>(
        API_URLS.UPLOAD_CLOUD,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (resp.data.statusCode === 200) {
        const item = resp.data.data!;
        if (item.originalFileName && item.url) {
          Swal.fire({
            icon: "success",
            title: "Tải ảnh thành công!!",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
          });
          // Đánh dấu thành công
          setFileStatuses({
            file,
            status: "success",
            uploadedUrl: item.url,
          });

          setEditedSpace((prev) => ({
            ...prev!,
            url: item.url ?? "",
          }));
        }
      } else {
        setFileStatuses({
          file,
          status: "error",
          error: resp.data.message,
        });
        Swal.fire({
          icon: "error",
          title: `Tải ảnh thất bại ${fileStatuses?.error}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      const message = err.response?.data?.message || err.message;

      // Đánh dấu lỗi nếu request bị lỗi
      setFileStatuses({
        file,
        status: "error",
        error: message,
      });

      Swal.fire({
        icon: "error",
        title: `Tải ảnh thất bại ${fileStatuses?.error}`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    }
  };

  // Xử lý cho trang cấu hình nối tour.

  /**
   * Xử lý chọn node trung tâm
   * @param spaceId  : id không gian hiện tại
   * @param masterNodeId : node trung tâm trong id.
   * @returns Lựa chọn node trung tâm mới, cập nhật id vào trường masterNodeId của spaces.
   */
  const handleSelect = async (spaceId: number, masterNodeId: number) => {
    if (!masterNodeId || masterNodeId === 0) return;

    try {
      const payload = {
        id: spaceId,
        masterNodeId: masterNodeId,
      };

      const response = await axios.post(
        API_URLS.ADMIN_CHANGE_MASTER_NODE_BY_ID,
        payload
      );

      console.log("Cập nhật thành công:", response.data.message);
      // Thêm toast hoặc cập nhật UI nếu cần
    } catch (error) {
      console.error("Lỗi khi cập nhật master node:", error);
    }
  };

  const currentPanorama = panoramaList.find(
    (pano) =>
      !isNaN(Number(currentSelectId)) &&
      Number(pano.id) === Number(currentSelectId)
  );

  const hotspots = useSelector((state: RootState) => state.hotspots);

  const hotspotNavigations = useSelector(getFilteredHotspotNavigationInList);
  const hotspotInfos = useSelector(getFilteredHotspotInformationInList);
  const hotspotModels = useSelector(getFilteredHotspotModelInList);
  const hotspotMedias = useSelector(getFilteredHotspotMediaInList);

  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null);

  const [isTextureReady, setIsTextureReady] = useState(false);
  const [cameraAngle, setCameraAngle] = useState(0);

  /**
   *
   * @param targetNodeId : Id node đích cần di chuyển.
   * @param hotspotTargetPosition : Thay thế vị trí camera hướng đến tại vị trí hotspot mục tiêu.
   */
  const handleHotspotNavigate = (
    targetNodeId: string,
    hotspotTargetPosition: [number, number, number]
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const control = controlsRef.current;
    const originalFov = camera.fov;
    const zoomTarget = 45; // Hiệu ứng zoom in đến vị trí mong muốn.

    const handleSelectNode = (id: string) => {
      setIsTextureReady(false);

      dispatch(selectPanorama(id));
      setCurrentHotspotId(null);
    };

    const [x, y, z] = hotspotTargetPosition;

    handleSelectNode(targetNodeId);
  };

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const handleOpenMenu = () => {
    setIsMenuVisible((preState) => !preState);
  };

  const tasks = [
    {
      id: 2,
      title: "Thông tin cơ bản",
    },
    {
      id: 3,
      title: "Nối điểm tương tác",
    },
  ];
  const { openTaskIndex, handleOpenTask } = useSequentialTasks(tasks.length);

  const [preTaskIndex, setPreTaskIndex] = useState<number | null>(null);
  const [assignable, setAssignable] = useState(false);
  const [validIcon, setValidIcon] = useState(true);
  const [currentHotspotType, setCurrentHotspotType] = useState(1);

  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);

  const handleOnPropsChange = (updatedProps: BaseHotspot) => {
    setBasicProps(updatedProps);
  };

  const getTaskContentById = (id: number): React.ReactNode => {
    switch (id) {
      case 2:
        return (
          <>
            <Task2 cameraRef={cameraRef} isLocked={true} />
          </>
        );
      case 3:
        return (
          <>
            <Task3
              isAssignable={assignable}
              setAssignable={setAssignable}
              setValidIcon={setValidIcon}
              setCurrentHotspotType={setCurrentHotspotType}
              onPropsChange={handleOnPropsChange}
              currentPanorama={currentPanorama}
              limitNav={false} //Không lấy giới hạn navigation
            />
          </>
        );
      default:
        return null;
    }
  };

  const hotspotPosition = useSelector(
    (state: RootState) => state.hotspots.hotspotPositions
  );
  /**
   * dùng để nhận giá trị trả về từ OptionHotspot.tsx để update cho đúng hotspot
   */
  const [currentHotspotId, setCurrentHotspotId] = useState<string | null>(null);
  /**
   *
   * @param e : Sự kiện click chuột từ frontend
   * @param point : Vector3d: x, y, z
   */
  const handleScenePointerDown = (
    e: ThreeEvent<PointerEvent>,
    point: THREE.Vector3
  ) => {
    if (!currentHotspotType || !assignable) {
      return;
    }

    if (!validIcon) {
      Swal.fire({
        title: "Cảnh báo",
        text: "Vui lòng chọn Icon trước khi click",
        icon: "warning",
        showCancelButton: false,
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }

    // Với hotspot loại 1, 2, 4
    const updatedProps: BaseHotspot = {
      ...(basicProps as Required<BaseHotspot>),
      positionX: point.x,
      positionY: point.y,
      positionZ: point.z,
    };

    switch (currentHotspotType) {
      case 1:
        dispatch(
          addNavigationHotspot({
            ...updatedProps,
            type: 1,
            targetNodeId: "",
          })
        );
        break;
    }
    dispatch(
      addHotspotPosition({
        nodeId: currentSelectId ? currentSelectId : "",
        hotspotPosition: [point.x, point.y, point.z],
      })
    );

    if ([1, 2, 4].includes(currentHotspotType)) {
      setAssignable(false);
      setCurrentHotspotType(1);
    }
  };

  const handleUpdateTourInSpace = async () => {
    if (panoramaList.length === 0) {
      alert("Panorama không chứa giá trị..");
      return;
    }
    try {
      //Step1: Mapping dữ liệu Redux với Request bên backend.
      const payload = TourNodeRequestMapper.mapOneNodeLinkRequest(
        panoramaList,
        hotspots.hotspotList.filter((h): h is HotspotNavigation => h.type === 1)
      );

      // Step2: Gửi lên backend
      const response = await axios.post(API_URLS.ADMIN_LINK_NODES, payload);
      if (response.data?.statusCode === 1000) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Lưu thành công",
        }).then(() => {});
      } else {
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text:
            "Xuất bản thất bại: " +
            (response.data?.message || "Không rõ lý do"),
        });
      }
    } catch (error) {
      console.log("Lỗi khi xuất bản: ", error);
    }
  };
  const [isViewMode, setIsViewMode] = useState<Number>(1);
  const [editInformation, setEditInformation] = useState<boolean>(false);
  const handleEditSpace = () => {
    if (!editInformation) {
      setOriginalSpace(currentSpace);
      setEditedSpace(currentSpace);
    }

    setEditInformation((p) => !p);
  };

  // Cập nhật không gian trong overview.
  const handleUpdateSpace = async () => {
    const changeFields: Partial<Space> = {};

    if (!editedSpace) return;

    //So sánh EditedSpace & OrginalSpace.
    if (editedSpace.name !== originalSpace?.name)
      changeFields.name = editedSpace.name;
    if (editedSpace.fieldId !== originalSpace?.fieldId)
      changeFields.fieldId = editedSpace.fieldId;
    if (editedSpace.description !== originalSpace?.description)
      changeFields.description = editedSpace.description;
    if (editedSpace.masterNodeId !== originalSpace?.masterNodeId)
      changeFields.masterNodeId = editedSpace.masterNodeId;
    if (editedSpace.status !== originalSpace?.status)
      changeFields.status = editedSpace.status;
    if (editedSpace.url !== originalSpace?.url)
      changeFields.url = editedSpace.url;

    if (Object.keys(changeFields).length === 0) {
      Swal.fire("Không có thay đổi nào!", "", "info");
      setEditInformation(false);
      return;
    }

    //Nếu có thay đổi => gửi API.
    try {
      const response = await axios.patch(
        `${API_URLS.ADMIN_UPDATE_SPACE_BY_ID}/${spaceId}`,
        changeFields
      );

      if (response.data.statusCode === 1000) {
        Swal.fire({
          title: "Thành công",
          text: `${response.data?.message}`,
          icon: "success",
          showCancelButton: false,
          toast: true,
          timer: 2000,
          position: "top-end",
          showConfirmButton: false,
        });
        const updatedSpace = response.data.data;
        setCurrentSpace(updatedSpace);

        setEditInformation(false);
      } else {
        Swal.fire({
          title: "Thất bại",
          text: `${response.data?.message || ""}`,
          icon: "error",
          showCancelButton: false,
          toast: true,
          timer: 2000,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật space:", error);
      Swal.fire("Lỗi kết nối", error?.message || "Không rõ lý do", "error");
    }
  };

  const cancelEditInformation = () => {
    setEditedSpace(originalSpace);
    setEditInformation(false);
  };

  if (!currentSpace) return <p>Đang tải thông tin không gian...</p>;
  return (
    <>
      <div className={styles.space_container}>
        <div className={styles.space_header}>
          <IoChevronBack
            className={styles.space_icon_back}
            onClick={() => navigate(-1)}
          />
          <p className={styles.space_title}>{currentSpace.name} </p>
          <div className={styles.space_mode}>
            <div className={styles.radio_container}>
              <label className={styles.radio_item}>
                <input
                  type="radio"
                  name="radio"
                  value="overview"
                  checked={isViewMode === 1}
                  onChange={() => {
                    if (isViewMode !== 1) setIsViewMode(1);
                  }}
                />
                <span className={styles.radio_name}>Tổng quan</span>
              </label>
              <label className={styles.radio_item}>
                <input
                  type="radio"
                  name="radio"
                  value="floor"
                  checked={isViewMode === 2}
                  onChange={() => {
                    if (isViewMode !== 2) setIsViewMode(2);
                  }}
                />
                <span className={styles.radio_name}>Cấu hình</span>
              </label>

              <label className={styles.radio_item}>
                <input
                  type="radio"
                  name="radio"
                  id="wall"
                  value="wall"
                  checked={isViewMode === 3}
                  onChange={() => {
                    if (isViewMode !== 3) setIsViewMode(3);
                  }}
                />
                <span className={styles.radio_name}>Sơ đồ</span>
              </label>
            </div>
          </div>
        </div>
        <div className={styles.space_content}>
          {isViewMode === 1 ? (
            <div className={styles.space_preview_tour}>
              <div
                className={styles.space_overview}
                style={{
                  border: editInformation ? "1px solid #267026" : "",
                }}
              >
                <div className={styles.space_overview_left}>
                  <img
                    src={
                      editInformation
                        ? editedSpace?.url ?? ""
                        : currentSpace?.url ?? ""
                    }
                    alt="anh-khong-gian"
                    className={styles.space_img}
                    style={{
                      filter: editInformation ? "brightness(0.6)" : "",
                    }}
                  />
                  {editInformation ? (
                    fileStatuses && fileStatuses.status === "uploading" ? (
                      <div className={stylesLoading.loaderWrapper}>
                        <div className={stylesLoading.loader}></div>
                      </div>
                    ) : (
                      <span
                        className={styles.space_img_custom}
                        onClick={() => {
                          inputImageRef.current?.click();
                        }}
                      >
                        <input
                          ref={inputImageRef}
                          type="file"
                          onChange={handleFileChange}
                          accept={".jpg , .jpeg, .avif, .webp, .png"}
                          style={{ display: "none" }}
                        />
                        <CiEdit />
                      </span>
                    )
                  ) : (
                    ""
                  )}
                </div>

                <div className={styles.space_overview_right}>
                  <div className={styles.overview_information}>
                    <label htmlFor="field" className={styles.label_information}>
                      Lĩnh vực:
                    </label>
                    <div className={styles.content_information}>
                      <select
                        className={styles.custom_select}
                        name="field"
                        id="field"
                        disabled={!editInformation}
                        value={
                          editInformation
                            ? editedSpace?.fieldId ?? ""
                            : currentSpace?.fieldId ?? ""
                        }
                        onChange={
                          editInformation
                            ? (e) =>
                                setEditedSpace((prev) => ({
                                  ...prev!,
                                  fieldId: parseInt(e.target.value, 10),
                                }))
                            : undefined
                        }
                      >
                        <option value="">Chọn lĩnh vực</option>

                        {fields !== null &&
                          fields.map((field) => (
                            <option key={field.id} value={field.id}>
                              {field.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.overview_information}>
                    <div className={styles.label_information}>Trạng thái: </div>
                    <div className={styles.content_information}>
                      <StatusToggle
                        id={currentSpace.id}
                        status={currentSpace.status}
                        apiUrl={API_URLS.ADMIN_CHANGE_SPACE_STATUS}
                        type="space"
                        editable={editInformation}
                      />
                    </div>
                  </div>
                  <div className={styles.overview_information}>
                    <div className={styles.label_information}>
                      Tour mặc định:{" "}
                    </div>
                    <div className={styles.content_information}>
                      <select
                        className={styles.custom_select}
                        value={
                          editInformation
                            ? editedSpace?.masterNodeId ?? ""
                            : currentSpace?.masterNodeId ?? ""
                        }
                        onChange={
                          editInformation
                            ? (e) =>
                                setEditedSpace((prev) => ({
                                  ...prev!,
                                  masterNodeId: parseInt(e.target.value, 10),
                                }))
                            : undefined
                        }
                        disabled={!editInformation}
                      >
                        <option value="">Chọn tour mặc định</option>
                        {panoramaList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.config.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.overview_information}>
                    <label className={styles.label_information} htmlFor="input">
                      Tên không gian :{" "}
                    </label>
                    <div className={styles.content_information}>
                      <input
                        type="text"
                        id="input"
                        required
                        readOnly={!editInformation}
                        value={
                          editInformation
                            ? editedSpace?.name ?? ""
                            : currentSpace?.name ?? ""
                        }
                        onChange={
                          editInformation
                            ? (e) => {
                                setEditedSpace((prev) => {
                                  if (!prev) return prev;

                                  return {
                                    ...prev,
                                    name: e.target.value,
                                    code: RemoveVietnameseTones(e.target.value),
                                  };
                                });
                              }
                            : undefined
                        }
                      />
                      <span className={styles.content_code}>
                        (
                        {editInformation
                          ? editedSpace?.code ?? ""
                          : currentSpace?.code ?? ""}
                        )
                      </span>
                    </div>
                  </div>
                  <div className={styles.overview_information}>
                    <label
                      className={styles.label_information}
                      htmlFor="description"
                    >
                      Mô tả:{" "}
                    </label>
                    <textarea
                      id="description"
                      value={
                        editInformation
                          ? editedSpace?.description ?? ""
                          : currentSpace?.description ?? ""
                      }
                      onChange={
                        editInformation
                          ? (e) =>
                              setEditedSpace((prev) => {
                                if (!prev) return prev;

                                const textNew = e.target.value;

                                if (textNew.length > MAX_DESCRIPTION)
                                  return prev;

                                return {
                                  ...prev!,
                                  description: e.target.value,
                                };
                              })
                          : undefined
                      }
                      readOnly={!editInformation}
                      rows={5}
                      cols={40}
                      placeholder="Tối đa 300 ký tự."
                      className={styles.description_content}
                    />
                    <span></span>
                    <span className={styles.description_count}>
                      {editInformation
                        ? editedSpace?.description?.length
                        : currentSpace?.description?.length}
                      /{MAX_DESCRIPTION} ký tự
                    </span>
                  </div>

                  <div className={styles.edit_information}>
                    {editInformation ? (
                      <>
                        <button
                          className={styles.edit_information_btn}
                          onClick={handleUpdateSpace}
                        >
                          Lưu <FaSave />
                        </button>
                        <button
                          className={styles.edit_information_btn}
                          onClick={cancelEditInformation}
                        >
                          Huỷ
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.edit_information_btn}
                        onClick={handleEditSpace}
                      >
                        Chỉnh sửa <TiEdit />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.space_statistic}></div>
            </div>
          ) : isViewMode === 2 && currentSpace.masterNodeId ? (
            <div className={styles.space_preview_tour}>
              <div className={styles.toggle_right_menu}>
                <IoMdMenu
                  className={styles.show_menu}
                  onClick={() => handleOpenMenu()}
                />
              </div>

              <Canvas
                camera={{
                  fov: 75,
                  aspect: window.innerWidth / window.innerHeight,
                  near: 0.1,
                  far: 1000,
                  position: [0, 0, DEFAULT_ORIGINAL_Z],
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
              >
                <Environment preset="studio" background={false} />
                <axesHelper args={[10]} position={[0, -90, 0]} />
                <UpdateCameraOnResize />
                <TourScene
                  nodeId={currentSelectId ?? ""}
                  radius={RADIUS_SPHERE}
                  sphereRef={sphereRef}
                  textureCurrent={currentPanorama?.url ?? "/khoa.jpg"}
                  yawOffsetCurrent={currentPanorama?.config.yawOffset ?? 0}
                  onPointerDown={handleScenePointerDown}
                  lightIntensity={currentPanorama?.config.lightIntensity ?? 1}
                  onTextureReady={() => setIsTextureReady(true)}
                />

                <CamControls
                  targetPosition={targetPosition}
                  sphereRef={sphereRef}
                  cameraRef={cameraRef}
                  controlsRef={controlsRef}
                  autoRotate={false}
                  autoRotateSpeed={0}
                  onAngleChange={setCameraAngle}
                />

                {hotspotNavigations
                  .filter((hotspot) => hotspot.nodeId === currentSelectId)
                  .map((hotspot) => (
                    <GroundHotspot
                      key={hotspot.id}
                      onNavigate={(targetNodeId, cameraTargetPosition) => {
                        if (isInteger(hotspot.id)) {
                          return;
                        }
                        // const isNumericString = /^\d+$/.test(hotspot.id);
                        // if (isNumericString) {
                        //   return;
                        // }
                        handleHotspotNavigate(
                          targetNodeId,
                          cameraTargetPosition
                        );
                      }}
                      setCurrentHotspotId={setCurrentHotspotId}
                      hotspotNavigation={hotspot}
                      blockUpdate={isInteger(hotspot.id)} //Nếu id dạng số => là của tour => không thể cập nhật.
                    />
                  ))}

                {isTextureReady &&
                  hotspotInfos
                    .filter((hotspot) => hotspot.nodeId === currentSelectId)
                    .map((hotspot) => (
                      <GroundHotspotInfo
                        key={hotspot.id}
                        setCurrentHotspotId={setCurrentHotspotId}
                        hotspotInfo={hotspot}
                      />
                    ))}
                {isTextureReady &&
                  hotspotModels
                    .filter((hotspot) => hotspot.nodeId === currentSelectId)
                    .map((hotspot) => (
                      <GroundHotspotModel
                        key={hotspot.id}
                        setCurrentHotspotId={setCurrentHotspotId}
                        hotspotModel={hotspot}
                      />
                    ))}

                {isTextureReady &&
                  hotspotMedias
                    .filter((hotspot) => hotspot.nodeId === currentSelectId)
                    .map((hotspot) => (
                      <VideoMeshComponent
                        key={hotspot.id}
                        hotspotMedia={hotspot}
                        setCurrentHotspotId={setCurrentHotspotId}
                      />
                    ))}
              </Canvas>

              {/* <div
                className={`${styles.space_right_menu} ${
                  isMenuVisible ? styles.show : ""
                }`}
              >
                <div className={styles.rightTitle}>
                  <FaAngleRight className={styles.close_menu_btn} />
                  <h2>Cấu hình</h2>
                </div>

                <RightMenuCreateTour
                  tasks={tasks}
                  openTaskIndex={openTaskIndex}
                  onTaskClick={handleOpenTask}
                  setPreOpenTask={setPreTaskIndex}
                  saveLinkNode={true}
                />
              </div> */}

              <AnimatePresence>
                {isMenuVisible && (
                  <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`${styles.rightMenu} `}
                  >
                    <div className={styles.rightTitle}>
                      <FaAngleRight
                        className={styles.close_menu_btn}
                        onClick={handleOpenMenu}
                      />
                      <h2>Cấu hình</h2>
                    </div>

                    <RightMenuCreateTour
                      tasks={tasks}
                      openTaskIndex={openTaskIndex}
                      onTaskClick={handleOpenTask}
                      setPreOpenTask={setPreTaskIndex}
                      saveLinkNode={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isMenuVisible &&
                  openTaskIndex !== null &&
                  currentHotspotId === null && (
                    <motion.div
                      initial={{ y: 800, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 800, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`${styles.task_container}`}
                    >
                      <TaskContainerCT
                        id={preTaskIndex}
                        name={
                          tasks.find((t) => t.id === preTaskIndex)?.title || ""
                        }
                      >
                        {preTaskIndex
                          ? getTaskContentById(openTaskIndex ?? preTaskIndex)
                          : ""}
                      </TaskContainerCT>
                    </motion.div>
                  )}
              </AnimatePresence>
              <AnimatePresence>
                {currentHotspotId !== null && (
                  <motion.div
                    initial={{ y: 800, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 800, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`${styles.update_hotspot_container} `}
                  >
                    <UpdateHotspot
                      hotspotId={currentHotspotId}
                      setHotspotId={setCurrentHotspotId}
                      onPropsChange={handleOnPropsChange}
                      limitNav={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className={styles.update_link_tour}>
                <span
                  className={styles.update_link_tour_btn}
                  onClick={handleUpdateTourInSpace}
                >
                  Lưu
                </span>
              </div>

              {/* <div
                className={`${styles.task_container} ${
                  isMenuVisible &&
                  openTaskIndex !== null &&
                  currentHotspotId === null
                    ? styles.show
                    : ""
                }`}
              >
                <TaskContainerCT
                  id={preTaskIndex}
                  name={tasks.find((t) => t.id === preTaskIndex)?.title || ""}
                >
                  {preTaskIndex
                    ? getTaskContentById(openTaskIndex ?? preTaskIndex)
                    : ""}
                </TaskContainerCT>
              </div>

              <div
                className={`${styles.update_hotspot_container} ${
                  currentHotspotId != null ? styles.show : ""
                }`}
              >
                <UpdateHotspot
                  hotspotId={currentHotspotId}
                  setHotspotId={setCurrentHotspotId}
                  onPropsChange={handleOnPropsChange}
                  limitNav={false}
                />
              </div>
              <div className={styles.update_link_tour}>
                <span
                  className={styles.update_link_tour_btn}
                  onClick={handleUpdateTourInSpace}
                >
                  Lưu
                </span>
              </div> 
              */}
            </div>
          ) : currentSpace.masterNodeId ? (
            <div className={styles.space_preview_tour}>
              <TrackingSpace
                masterId={`${currentSpace.masterNodeId}`}
                panoramaList={panoramaList}
                hotspotNavigations={hotspotNavigations}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default SpaceDetail;
