import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import styles from "../../styles/managerTourDetail.module.css";
import stylesOverview from "../../styles/spaceDetail.module.css";
import * as THREE from "three";
import {
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
  FaAngleUp,
} from "react-icons/fa6";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store.ts";
import { NodeItem } from "./NodeItem.tsx";
import SearchBar from "../../features/SearchBar.tsx";
import axios from "axios";
import { API_URLS } from "../../env.ts";
import { Perf } from "r3f-perf";
import {
  addPanorama,
  addPanoramasFromResponse,
  clearPanorama,
  PanoramaConfig,
  PanoramaItem,
  selectPanorama,
  setSpaceId,
  smartUpdatePanoramasFromResponse,
} from "../../redux/slices/PanoramaSlice.ts";
import {
  addHotspotPosition,
  addHotspotsFromResponse,
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  addNavigationHotspot,
  BaseHotspot,
  clearHotspot,
} from "../../redux/slices/HotspotSlice.ts";
import {
  NodeExpandResponse,
  NodeResponse,
  TourNodeRequestMapper,
} from "../../utils/TourNodeRequestMapper.ts";
import { IoChevronBack } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import {
  DEFAULT_ORIGINAL_Z,
  MAX_DESCRIPTION,
  RADIUS_SPHERE,
} from "../../utils/Constants.ts";
import { Environment } from "@react-three/drei";
import UpdateCameraOnResize from "../UpdateCameraOnResize.tsx";
import TourScene from "../visitor/TourScene.tsx";
import CamControls from "../visitor/CamControls.tsx";
import GroundHotspot from "../visitor/GroundHotspot.tsx";
import GroundHotspotInfo from "../visitor/GroundHotspotInfo.tsx";
import GroundHotspotModel from "../visitor/GroundHotspotModel.tsx";
import VideoMeshComponent from "./VideoMesh.tsx";
import RightMenuCreateTour from "./RightMenuCT.tsx";
import UpdateHotspot from "./taskCreateTourList/UpdateHotspot.tsx";
import TaskContainerCT from "./TaskContainerCT.tsx";
import { IoMdMenu } from "react-icons/io";
import { tasks } from "../../pages/admin/CreateTourStep2.tsx";
import { useSequentialTasks } from "../../hooks/useSequentialTasks.ts";
import Swal from "sweetalert2";
import Task1 from "./taskCreateTourList/Task1DisplayInfo.tsx";
import Task2 from "./taskCreateTourList/Task2BasicConfig.tsx";
import Task3 from "./taskCreateTourList/Task3AddHotspot.tsx";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import MiniMap from "../Minimap.tsx";
import {
  getFilteredHotspotInformationInList,
  getFilteredHotspotMediaInList,
  getFilteredHotspotModelInList,
  getFilteredHotspotNavigationInList,
} from "../../redux/slices/Selectors.ts";
import StatusToggle from "./ToggleChangeStatus.tsx";
import { ApiResponse } from "./UploadFile.tsx";
import Space from "../../pages/admin/ManagerSpace.tsx";
import { RemoveVietnameseTones } from "../../utils/RemoveVietnameseTones.ts";
import { TiEdit } from "react-icons/ti";
import { FaSave } from "react-icons/fa";
import { GrSecure } from "react-icons/gr";

interface PanoramaItemWithField extends PanoramaItem {
  fieldId: string;
}
interface PanoramaItemForApprove extends PanoramaItem {
  userId: string;
  fieldId: string;
  numView: number;
  updatedAt: number;
  email: string;
  userName: string;
  avatar: string;
}

const ManagerTourDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { nodeId } = useParams();

  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  // Lấy danh sách fields từ Redux
  const fields = useSelector((state: RootState) => state.data.fields);
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const users = useSelector((state: RootState) => state.data.users);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState<boolean>(false);

  const [fieldId, setFieldId] = useState<string | null>(null);
  const [originalMasterNode, setOriginalMasterNode] =
    useState<PanoramaItemForApprove | null>(null);
  const [messageRefuse, setMessageRefuse] = useState<string>("");
  const [isValidated, setIsValidated] = useState(true);

  useEffect(() => {
    if (!nodeId) return;

    axios
      .post(API_URLS.GET_FULL_TOUR, {
        nodeId: Number(nodeId),
      })
      .then(async (resp) => {
        const nodes: NodeExpandResponse[] = resp.data.data;

        const mainNode = nodes.find((node) => node.id == nodeId);
        if (mainNode) {
          setFieldId(mainNode.fieldId);
          setAuthorId(mainNode.userId);

          try {
            const response = await axios.post(
              API_URLS.ADMIN_GET_SPACE_OF_FIELD,
              {
                fieldId: mainNode.fieldId,
              }
            );
            if (response.data.statusCode === 1000) {
              setListSpace(response.data.data);
              setOriginalListSpace(response.data.data);
            } else {
              console.warn("Lỗi dữ liệu space", response.data.message);
              //fallback lấy mỗi cái đang active đủ dùng.
              setListSpace([
                { id: Number(mainNode.spaceId), name: mainNode.spaceName },
              ]);
              setOriginalListSpace([
                { id: Number(mainNode.spaceId), name: mainNode.spaceName },
              ]);
            }
          } catch (err) {
            console.warn("Lỗi khi gọi API space", err);
            //fallback lấy mỗi cái đang active đủ dùng.
            setListSpace([
              { id: Number(mainNode.spaceId), name: mainNode.spaceName },
            ]);
            setOriginalListSpace([
              { id: Number(mainNode.spaceId), name: mainNode.spaceName },
            ]);
          }
        }

        dispatch(clearPanorama());
        dispatch(clearHotspot());
        const { panoramaList, hotspotList } =
          TourNodeRequestMapper.mapToPanoramaAndHotspots(nodes);
        dispatch(addPanoramasFromResponse(panoramaList));
        dispatch(addHotspotsFromResponse(hotspotList));
        dispatch(setSpaceId(mainNode?.spaceId ?? "0"));

        //Set giá trị api cho biến originalMasterNode
        const currentTourExpandField = {
          ...currentTour,
          fieldId: mainNode?.fieldId,
          numView: mainNode?.numView,
          userId: mainNode?.userId,
          updatedAt: mainNode?.updatedAt,
          userName: mainNode?.userName,
          email: mainNode?.email,
          avatar: mainNode?.avatar,
        };
        setOriginalMasterNode(currentTourExpandField);
      })
      .catch((err) => {
        console.warn("Lỗi không lấy được node", err);
      });
  }, [nodeId, dispatch]);

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const currentTour = panoramaList.find((p) => p.id == nodeId);

  //Sử dụng trên overview chỉnh thông tin.
  const currentNodeView = panoramaList.find((p) => p.id == currentSelectId); //Sử dụng để sửa thông tin.

  const panoramasOtherTour = panoramaList.filter(
    (p) => p.config.status === 2 && p.id !== nodeId
  );

  const hotspots = useSelector((state: RootState) => state.hotspots);

  const auth = useSelector((state: RootState) => state.auth.user);

  const hotspotNavigations = useSelector(getFilteredHotspotNavigationInList);
  const hotspotInformations = useSelector(getFilteredHotspotInformationInList);
  const hotspotModels = useSelector(getFilteredHotspotModelInList);

  const hotspotMedias = useSelector(getFilteredHotspotMediaInList);
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null);

  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);
  const [viewMode, setViewMode] = useState<number>(1);
  const [approveStatus, setApproveStatus] = useState<number>(2); //AproveStatus: 2 - Đồng ý. ApproveStatus: 4: Từ chối.
  const [editInformation, setEditInformation] = useState<boolean>(false);
  const [listSpace, setListSpace] = useState<{ id: number; name: string }[]>(
    []
  );
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [selectedFeedbackList, setSelectedFeedbackList] = useState<string[]>(
    []
  );

  const toggleFeedback = (id: string) => {
    const feedback = feedbackList.find((f) => f.id.toString() == id);
    if (!feedback) return;

    const content = feedback.content;

    setSelectedFeedbackList(
      (prev) =>
        prev.includes(content)
          ? prev.filter((c) => c != content) // Bỏ nếu đã có
          : [...prev, content] // Thêm nếu chưa có
    );
  };

  useEffect(() => {
    if (approveStatus === 4) {
      const handleFetchFeedback = async () => {
        try {
          const response = await axios.get(API_URLS.ADMIN_GET_FEEDBACK);
          if (response.data.data) {
            setFeedbackList(response.data.data);
          } else {
            console.warn("Lỗi khi lấy feedback", response.data.message);
          }
        } catch (error) {
          console.error("Lỗi khi gọi API feedback", error);
        }
      };
      handleFetchFeedback();
    }
  }, [approveStatus]);

  const [originalListSpace, setOriginalListSpace] = useState<
    { id: number; name: string }[]
  >([]);

  const handleEditTourOverview = () => {
    if (!editInformation) {
      const currentWithField = {
        ...currentTour,
        fieldId: fieldId,
      };
      setOriginalTour(currentWithField);
      setEditedTour(currentWithField);
    }
    setEditInformation((p) => !p);
  };

  const cancelEditTourOverview = () => {
    setEditedTour(originalTour);
    setEditInformation(false);
    setListSpace(originalListSpace);
  };

  //Lĩnh vực chỉ mang ý nghĩa để filter api cho space.
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await axios.post(API_URLS.ADMIN_GET_SPACE_OF_FIELD, {
          fieldId: fieldId,
        });

        if (response.data.statusCode === 1000) {
          setListSpace(response.data.data);
        } else {
          console.log("Lỗi khi lấy danh sách spaces", response.data.message);
        }
      } catch (error) {
        console.warn("Lỗi khi gọi API", error);
      }
    };

    fetchSpaces();
  }, []);

  const [originalTour, setOriginalTour] =
    useState<PanoramaItemWithField | null>(null);
  const [editedTour, setEditedTour] = useState<PanoramaItemWithField | null>(
    null
  );

  const [isTextureReady, setIsTextureReady] = useState(false);
  const [currentHotspotId, setCurrentHotspotId] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [preTaskIndex, setPreTaskIndex] = useState<number | null>(null);
  const [assignable, setAssignable] = useState(false);
  const [currentHotspotType, setCurrentHotspotType] = useState(1);
  const [validIcon, setValidIcon] = useState(true);
  const [cameraAngle, setCameraAngle] = useState(0);
  const hotspotPosition = useSelector(
    (state: RootState) => state.hotspots.hotspotPositions
  );
  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);

  const {
    positionX = 0,
    positionY = 0,
    positionZ = DEFAULT_ORIGINAL_Z,
    lightIntensity = 1,
    autoRotate = 0,
    speedRotate = 0,
    brightness = 1,
    contrast = 1,
    saturation = 1.2,
    grayscale = 0,
    exposure = 1,
  } = currentNodeView?.config ?? {};

  const handleSelectField = async (event: any) => {
    const fieldId = event?.target.value;

    setEditedTour((prev) => ({
      ...prev!,
      fieldId: fieldId,
    }));

    if (!fieldId) {
      setListSpace([]); // Nếu chọn "-- Chọn lĩnh vực --", reset danh sách spaces
      return;
    }

    try {
      const response = await axios.post(API_URLS.ADMIN_GET_SPACE_OF_FIELD, {
        fieldId: fieldId,
      });
      const listSpace = response.data.data;
      setListSpace(listSpace);
    } catch {
      console.log("call api choose field error");
    }
  };

  const handleUpdateTourOverview = async () => {
    const changeFields: {
      spaceId?: string;
      name?: string;
      description?: string;
      status?: number;
    } = {};

    if (!editedTour) return;

    if (editedTour.spaceId !== originalTour?.spaceId) {
      changeFields.spaceId = editedTour.spaceId;
    }

    if (editedTour.config.name !== originalTour?.config?.name) {
      changeFields.name = editedTour.config.name;
    }

    if (editedTour.config.description !== originalTour?.config?.description) {
      changeFields.description = editedTour.config.description;
    }

    if (editedTour.config.status !== originalTour?.config?.status) {
      changeFields.status = editedTour.config.status;
    }

    if (Object.keys(changeFields).length === 0) {
      setEditInformation(false);
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URLS.ADMIN_UPDATE_OVERVIEW_TOUR_BY_MASTERID}/${nodeId}`,
        changeFields
      );

      if (response.data.statusCode === 1000) {
        Swal.fire({
          title: "Thành công",
          text: `${response.data?.message}`,
          icon: "success",
          toast: true,
          timer: 2000,
          position: "top-end",
          showConfirmButton: false,
        });
        const nodes: NodeExpandResponse[] = response.data.data;

        const mainNode = nodes.find((node) => node.id == nodeId);
        if (mainNode) {
          setFieldId(mainNode.fieldId);

          try {
            const response = await axios.post(
              API_URLS.ADMIN_GET_SPACE_OF_FIELD,
              {
                fieldId: mainNode.fieldId,
              }
            );
            if (response.data.statusCode === 1000) {
              setListSpace(response.data.data);
              setOriginalListSpace(response.data.data);
            } else {
              console.warn("Lỗi dữ liệu space", response.data.message);
              //fallback lấy mỗi cái đang active đủ dùng.
              setListSpace([
                { id: Number(mainNode.spaceId), name: mainNode.spaceName },
              ]);
              setOriginalListSpace([
                { id: Number(mainNode.spaceId), name: mainNode.spaceName },
              ]);
            }
          } catch (err) {
            console.warn("Lỗi khi gọi API space", err);
            //fallback lấy mỗi cái đang active đủ dùng.
            setListSpace([
              { id: Number(mainNode.spaceId), name: mainNode.spaceName },
            ]);
            setOriginalListSpace([
              { id: Number(mainNode.spaceId), name: mainNode.spaceName },
            ]);
          }
        }

        const { panoramaList } =
          TourNodeRequestMapper.mapToPanoramaAndHotspots(nodes);
        dispatch(smartUpdatePanoramasFromResponse(panoramaList)); // chỉ cập nhật node.

        setEditInformation(false);
      } else {
        Swal.fire({
          title: "Thất bại",
          text: `${response.data?.message || ""}`,
          icon: "error",
          toast: true,
          timer: 2000,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật tour:", error);
      Swal.fire("Lỗi kết nối", error?.message || "Không rõ lý do", "error");
    }
  };

  const handleScenePointerDown = (
    e: ThreeEvent<PointerEvent>,
    point: THREE.Vector3
  ) => {
    if (!currentHotspotType || !assignable) {
      return;
    }
    const limit = (basicProps?.scale || 1) * 5 + 5;
    const minX = point.x - limit;
    const maxX = point.x + limit;
    const minY = point.y - limit;
    const maxY = point.y + limit;
    const minZ = point.z - limit;
    const maxZ = point.z + limit;

    const isNear = hotspotPosition
      .filter((h) => h.nodeId === currentSelectId)
      .some((h) =>
        h.hotspotPositions.some(
          (hotspot) =>
            hotspot.position[0] > minX &&
            hotspot.position[0] < maxX &&
            hotspot.position[1] > minY &&
            hotspot.position[1] < maxY &&
            hotspot.position[2] > minZ &&
            hotspot.position[2] < maxZ
        )
      );
    if (isNear) {
      Swal.fire({
        title: "Cảnh báo",
        text: "Các hotspot không được nằm gần nhau",
        icon: "warning",
        showCancelButton: false,
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
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

    const newPoints = [...currentPoints, [point.x, point.y, point.z]] as [
      number,
      number,
      number
    ][];

    // Với hotspot loại 3: thu thập 4 điểm và dispatch khi đủ
    if (currentHotspotType === 3) {
      setCurrentPoints(newPoints);

      if (newPoints.length === 4) {
        const updatedProps: BaseHotspot = {
          ...(basicProps as Required<BaseHotspot>),
          positionX: point.x,
          positionY: point.y,
          positionZ: point.z,
        };

        dispatch(
          addMediaHotspot({
            ...updatedProps,
            type: 3,
            mediaType: "",
            mediaUrl: "",
            caption: "",
            cornerPointList: JSON.stringify(newPoints),
          })
        );

        setAssignable(false);
        setCurrentHotspotType(1);
        setCurrentPoints([]);
      }
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

      case 2:
        dispatch(
          addInformationHotspot({
            ...updatedProps,
            type: 2,
            content: "",
            backgroundColorContent: { r: 0, g: 0, b: 0, a: 0 },
            borderColorContent: "",
            borderSizeContent: 0,
          })
        );
        break;

      case 4:
        dispatch(
          addModelHotspot({
            ...updatedProps,
            type: 4,
            modelUrl: "",
            name: "",
            description: "",
            autoRotate: 0,
            thumbnailUrl: "",
          })
        );
        break;
    }
    dispatch(
      addHotspotPosition({
        nodeId: currentSelectId ? currentSelectId : "",
        hotspotPosition: {
          id: updatedProps.id,
          position: [point.x, point.y, point.z],
        },
      })
    );

    if ([1, 2, 4].includes(currentHotspotType)) {
      setAssignable(false);
      setCurrentHotspotType(1);
    }
  };

  /**
   *
   * Xử lý cập nhật phê duyệt.
   */
  const handleApproveTour = async () => {
    try {
      const response = await axios.post(`${API_URLS.ADMIN_APPROVE_TOUR}`, {
        nodeId: Number(nodeId),
        email: originalMasterNode?.email,
        feedbackList: approveStatus == 2 ? "" : JSON.stringify(selectedFeedbackList),
        moreFeedback: approveStatus == 2 ? "" : messageRefuse,
      });

      if (response.data.data) {
        Swal.fire({
          title: "Phê duyệt thành công",
          text: "Phê duyệt thành công",
          icon: "success",
          toast: true,
          timer: 2000,
          position: "top-end",
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Thất bại",
          text: "Phê duyệt thất bại.",
          icon: "error",
          toast: true,
          timer: 2000,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi phê duyệt tour:", error);
      Swal.fire("Lỗi kết nối", error?.message || "Không rõ lý do", "error");
    }
  };

  const handleOpenMenu = () => {
    setIsMenuVisible((preState) => !preState);
  };
  const handleOnPropsChange = (updatedProps: BaseHotspot) => {
    setBasicProps(updatedProps);
  };

  const { openTaskIndex, handleOpenTask } = useSequentialTasks(tasks.length);

  const handleSelectNode = (id: string) => {
    setIsTextureReady(false);
    dispatch(selectPanorama(id));
    setCurrentHotspotId(null);
  };

  /**
   *
   * @param targetNodeId : Id node đích cần di chuyển.
   * @param hotspotTargetPosition : Thay thế vị trí camera hướng đến tại vị trí hotspot mục tiêu.
   */

  const handleHotspotNavigate = (
    targetNodeId: string,
    hotspotTargetPosition: [number, number, number]
  ) => {
    if (panoramasOtherTour.some((p) => p.id === targetNodeId)) return;
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const control = controlsRef.current;
    const originalFov = camera.fov;
    const zoomTarget = 45; // Hiệu ứng zoom in đến vị trí mong muốn.

    const [x, y, z] = hotspotTargetPosition;

    // === Bước 2: Zoom vào
    handleSelectNode(targetNodeId);
  };

  const handleUpdateTour = async () => {
    if (panoramaList.length === 0) {
      alert("spaceId bị null hay panorama không chứa giá trị..");
      return;
    }
    try {
      //Step1: Mapping dữ liệu Redux với Request bên backend.
      const payload = TourNodeRequestMapper.mapOneNodeUpdateRequest(
        panoramaList,
        hotspots.hotspotList
      );

      // Step2: Gửi lên backend
      const response = await axios.post(API_URLS.ADMIN_UPDATE_NODES, payload);
      if (response.data.data) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thành công",
        }).then(() => {
          // setIsUpdateTour(false);
          // dispatch(fetchMasterNodes());
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text:
            "Cập nhật thất bại: " +
            (response.data?.message || "Không rõ lý do"),
        });
      }
    } catch (error) {
      console.log("Lỗi khi cập nhật: ", error);
    }
  };

  const getTaskContentById = (id: number): React.ReactNode => {
    switch (id) {
      case 1:
        return (
          <>
            <Task1 />
          </>
        );
      case 2:
        return (
          <>
            <Task2 cameraRef={cameraRef} />
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
              currentPanorama={currentNodeView}
              limitNav={true}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (!currentTour) return <p>Đang tải thông tin ...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IoChevronBack
          className={styles.tour_icon_back}
          onClick={() => navigate(-1)}
        />
        <p className={styles.tour_title}>{currentTour.config.name}</p>
        <div className={styles.tour_mode}>
          <div className={styles.radio_container}>
            <label className={styles.radio_item}>
              <input
                type="radio"
                name="radio"
                value="overview"
                checked={viewMode === 1}
                onChange={() => {
                  if (viewMode !== 1) setViewMode(1);
                }}
              />
              <span className={styles.radio_name}>Tổng quan</span>
            </label>
            <label className={styles.radio_item}>
              <input
                type="radio"
                name="radio"
                value="config_canvas"
                checked={viewMode === 2}
                onChange={() => {
                  if (viewMode !== 2) setViewMode(2);
                }}
              />
              <span className={styles.radio_name}>Cấu hình</span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {viewMode === 1 ? (
          <div className={styles.preview_tour}>
            <div
              className={styles.overview}
              style={{
                border: editInformation ? "1px solid #267026" : "",
              }}
            >
              <div className={styles.overview_left}>
                <img
                  src={currentTour.url ?? "https://placehold.co/600x400"}
                  alt="anh-khong-gian"
                  className={styles.img}
                />
              </div>

              <div className={styles.overview_right}>
                <div className={styles.overview_information}>
                  <label
                    htmlFor="field"
                    className={stylesOverview.label_information}
                  >
                    Lĩnh vực:
                  </label>
                  <div className={stylesOverview.content_information}>
                    <select
                      className={stylesOverview.custom_select}
                      name="field"
                      id="field"
                      disabled={!editInformation}
                      value={
                        editInformation
                          ? editedTour?.fieldId ?? ""
                          : fieldId ?? ""
                      }
                      onChange={editInformation ? handleSelectField : undefined}
                    >
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
                  <label
                    htmlFor="space"
                    className={stylesOverview.label_information}
                  >
                    Không gian:
                  </label>
                  <div className={stylesOverview.content_information}>
                    <select
                      className={stylesOverview.custom_select}
                      name="space"
                      id="space"
                      disabled={!editInformation}
                      value={
                        editInformation
                          ? editedTour?.spaceId ?? ""
                          : currentTour?.spaceId ?? ""
                      }
                      onChange={
                        editInformation
                          ? (e) =>
                              setEditedTour((prev) => ({
                                ...prev!,
                                spaceId: e.target.value,
                              }))
                          : undefined
                      }
                    >
                      <option value="">Chọn không gian</option>

                      {listSpace !== null &&
                        listSpace.map((space) => (
                          <option key={space.id} value={space.id}>
                            {space.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className={styles.overview_information}>
                  <div className={stylesOverview.label_information}>
                    Trạng thái:{" "}
                  </div>

                  {currentTour.config.status === 3 ? (
                    <div className={stylesOverview.content_information}>
                      {/* <StatusToggle
                        id={currentTour.id}
                        status={currentTour.config.status}
                        apiUrl={`${API_URLS.ADMIN_CHANGE_NODE_STATUS}`}
                        type="node"
                        editable={editInformation}
                      /> */}
                      <button
                        className={stylesOverview.edit_information_btn}
                        onClick={() => setApproveForm(true)}
                      >
                        {" "}
                        Chờ phê duyệt <GrSecure />
                      </button>
                    </div>
                  ) : (
                    <div className={stylesOverview.content_information}>
                      <StatusToggle
                        id={currentTour.id}
                        status={currentTour.config.status}
                        apiUrl={`${API_URLS.ADMIN_CHANGE_NODE_STATUS}`}
                        type="node"
                        editable={editInformation}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.overview_information}>
                  <label
                    className={stylesOverview.label_information}
                    htmlFor="input"
                  >
                    Tên không gian :{" "}
                  </label>
                  <div className={stylesOverview.content_information}>
                    <input
                      type="text"
                      id="input"
                      required
                      readOnly={!editInformation}
                      value={
                        editInformation
                          ? editedTour?.config?.name ?? ""
                          : currentTour.config?.name ?? ""
                      }
                      onChange={
                        editInformation
                          ? (e) => {
                              setEditedTour((prev) => {
                                if (!prev) return prev;

                                return {
                                  ...prev,
                                  config: {
                                    ...prev.config,
                                    name: e.target.value,
                                  },
                                };
                              });
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>

                <div className={stylesOverview.overview_information}>
                  <label
                    className={stylesOverview.label_information}
                    htmlFor="description"
                  >
                    Mô tả:{" "}
                  </label>
                  <textarea
                    id="description"
                    value={
                      editInformation
                        ? editedTour?.config.description ?? ""
                        : currentTour?.config.description ?? ""
                    }
                    onChange={
                      editInformation
                        ? (e) =>
                            setEditedTour((prev) => {
                              if (!prev) return prev;

                              const textNew = e.target.value;

                              if (textNew.length > MAX_DESCRIPTION) return prev;

                              return {
                                ...prev!,
                                config: {
                                  ...prev.config,
                                  description: textNew,
                                },
                              };
                            })
                        : undefined
                    }
                    readOnly={!editInformation}
                    rows={5}
                    cols={40}
                    placeholder="Tối đa 300 ký tự."
                    className={stylesOverview.description_content}
                  />
                  <span></span>
                  <span className={stylesOverview.description_count}>
                    {editInformation
                      ? editedTour?.config?.description?.length
                      : currentTour?.config?.description?.length}
                    /{MAX_DESCRIPTION} ký tự
                  </span>
                </div>

                <div className={stylesOverview.edit_information}>
                  {editInformation ? (
                    <>
                      <button
                        className={stylesOverview.edit_information_btn}
                        onClick={handleUpdateTourOverview}
                      >
                        Lưu <FaSave />
                      </button>
                      <button
                        className={stylesOverview.edit_information_btn}
                        onClick={cancelEditTourOverview}
                      >
                        Huỷ
                      </button>
                    </>
                  ) : auth.roleId != originalMasterNode?.userId ? (
                    ""
                  ) : (
                    <button
                      className={stylesOverview.edit_information_btn}
                      onClick={handleEditTourOverview}
                    >
                      Chỉnh sửa <TiEdit />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.space_statistic}></div>
          </div>
        ) : (
          <div className={styles.preview_tour}>
            <Canvas
              camera={{
                fov: 75,
                near: 0.1,
                far: 1000,
                position: [0, 0, DEFAULT_ORIGINAL_Z],
              }}
              className={styles.tourCanvas}
            >
              <UpdateCameraOnResize />
              <Environment preset="studio" background={false} />
              <axesHelper args={[10]} position={[0, -90, 0]} />
              <TourScene
                radius={RADIUS_SPHERE}
                sphereRef={sphereRef}
                // imageRef={imageRef}
                textureCurrent={currentNodeView.url}
                yawOffsetCurrent={currentNodeView.config.yawOffset ?? 0}
                onPointerDown={handleScenePointerDown}
                onTextureReady={() => setIsTextureReady(true)}
                lightIntensity={lightIntensity}
                brightness={brightness}
                contrast={contrast}
                saturation={saturation}
                grayscale={grayscale}
                exposure={exposure}
              />
              <CamControls
                controlsRef={controlsRef}
                targetPosition={targetPosition}
                cameraRef={cameraRef}
                sphereRef={sphereRef}
                autoRotate={currentNodeView.autoRotate === 1 ? true : false}
                autoRotateSpeed={
                  currentNodeView || currentNodeView.config.speedRotate == 0
                    ? 0.2
                    : currentNodeView.config.speedRotate
                }
                onAngleChange={(angle) => {
                  setCameraAngle(angle); // cameraAngle luôn là góc thật tại thời điểm hiện tại (0–360)
                }}
              />

              <MiniMap
                currentPanorama={currentNodeView}
                angleCurrent={cameraAngle}
                currentTour={nodeId}
                locked={userId !== authorId}
              />

              <Suspense fallback={null}>
                {isTextureReady &&
                  hotspotInformations
                    .filter(
                      (hotspot) =>
                        hotspot.nodeId == currentNodeView.id &&
                        hotspot.status == 1
                    )
                    .map((hotspot) => (
                      <GroundHotspotInfo
                        key={hotspot.id}
                        hotspotInfo={hotspot}
                        setCurrentHotspotId={setCurrentHotspotId}
                      />
                    ))}
              </Suspense>

              {isTextureReady &&
                hotspotNavigations
                  .filter((hotspot) => hotspot.nodeId == currentNodeView.id)
                  .map((hotspot) => (
                    <GroundHotspot
                      key={hotspot.id}
                      onNavigate={(targetNodeId, cameraTargetPosition) =>
                        handleHotspotNavigate(
                          targetNodeId,
                          cameraTargetPosition
                        )
                      }
                      hotspotNavigation={hotspot}
                      setCurrentHotspotId={setCurrentHotspotId}
                    />
                  ))}
              {isTextureReady &&
                hotspotModels
                  .filter((hotspot) => hotspot.nodeId == currentNodeView.id)
                  .map((hotspot) => (
                    <GroundHotspotModel
                      key={hotspot.id}
                      hotspotModel={hotspot}
                      setCurrentHotspotId={setCurrentHotspotId}
                    />
                  ))}
              {isTextureReady &&
                hotspotMedias
                  .filter((hotspot) => hotspot.nodeId == currentNodeView.id)
                  .map((hotspot) => (
                    <VideoMeshComponent
                      key={hotspot.id}
                      hotspotMedia={hotspot}
                      setCurrentHotspotId={setCurrentHotspotId}
                    />
                  ))}
            </Canvas>

            {userId === authorId ? (
              <>
                <div className={styles.toggle_right_menu}>
                  <IoMdMenu
                    className={styles.show_menu}
                    onClick={() => handleOpenMenu()}
                  />
                </div>
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
                        saveLinkNode={false}
                        isValidated={isValidated}
                        setIsValidated={setIsValidated}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* tasks */}
                <AnimatePresence>
                  {isMenuVisible &&
                    openTaskIndex !== null &&
                    currentHotspotId === null && (
                      <motion.div
                        initial={{ y: 1000, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 1000, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`${styles.task_container}`}
                      >
                        <TaskContainerCT
                          id={preTaskIndex}
                          name={
                            tasks.find((t) => t.id === preTaskIndex)?.title ||
                            ""
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
                      initial={{ y: 1000, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 1000, opacity: 0 }}
                      transition={{ duration: 1 }}
                      className={`${styles.update_hotspot_container} `}
                    >
                      <UpdateHotspot
                        hotspotId={currentHotspotId}
                        setHotspotId={setCurrentHotspotId}
                        onPropsChange={handleOnPropsChange}
                        limitNav={true}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      {/* Phê duyệt */}
      {approveForm ? (
        <div className={styles.approve_container}>
          <div className={styles.approve_form}>
            <div className={styles.approve_form_options}>
              <div className={styles.radio_container}>
                <label className={styles.radio_item} htmlFor="acceptApprove">
                  <input
                    id="acceptApprove"
                    type="radio"
                    name="radioApprove"
                    value="acceptApprove"
                    checked={approveStatus === 2}
                    onChange={() => {
                      if (approveStatus !== 2) setApproveStatus(2);
                    }}
                  />
                  <span className={styles.radio_name}>Duyệt</span>
                </label>
                <label className={styles.radio_item} htmlFor="refuseApprove">
                  <input
                    id="refuseApprove"
                    type="radio"
                    name="radioApprove"
                    value="refuseApprove"
                    checked={approveStatus === 4}
                    onChange={() => {
                      if (approveStatus !== 4) setApproveStatus(4);
                    }}
                  />
                  <span className={styles.radio_name}>Từ chối</span>
                </label>
              </div>
            </div>
            {approveStatus === 4 && (
              <>
                <div className={styles.approve_form_message}>
                  <label
                    className={stylesOverview.label_information}
                    htmlFor="message"
                  >
                    Phản hồi:
                  </label>
                  <div className={stylesOverview.feedback_list}>
                    {feedbackList.length > 0 &&
                      feedbackList.map((feedback) => {
                        const isSelected = selectedFeedbackList.includes(
                          feedback.content
                        );

                        return (
                          <div
                            key={feedback.id}
                            className={`${stylesOverview.feedback_item} ${
                              isSelected ? stylesOverview.selected : ""
                            }`}
                            onClick={() =>
                              toggleFeedback(feedback.id.toString())
                            }
                          >
                            <p className={stylesOverview.feedback_content}>
                              {feedback.content}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className={styles.approve_form_message}>
                  <textarea
                    id="message"
                    value={messageRefuse}
                    onChange={(e) => setMessageRefuse(e.target.value)}
                    rows={4}
                    cols={40}
                    placeholder="Mô tả thêm(Tối đa 300 ký tự):"
                    className={stylesOverview.description_content}
                  />
                </div>
              </>
            )}
            <div className={styles.approve_btn}>
              <button
                className={stylesOverview.edit_information_btn}
                onClick={() => setApproveForm(false)}
              >
                Huỷ
              </button>
              <button
                className={stylesOverview.edit_information_btn}
                onClick={() => {
                  handleApproveTour();
                  setApproveForm(false);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
export default ManagerTourDetail;
