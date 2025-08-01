import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/visitor/tourDetail.module.css";
import stylesRightMenu from "../../styles/createTourStep2.module.css";
import {
  DEFAULT_ORIGINAL_Z,
  getStatusNode,
  RADIUS_SPHERE,
} from "../../utils/Constants";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  FaAngleRight,
  FaAngleUp,
  FaComment,
  FaEye,
  FaX,
} from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import {
  fetchCommentOfNode,
  fetchHotspotTypes,
  fetchIcons,
} from "../../redux/slices/DataSlice";
import { formatTimeAgo } from "../../utils/formatDateTime";
import Swal from "sweetalert2";
import { API_URLS } from "../../env";
import VideoMeshComponent from "../../components/admin/VideoMesh";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import GroundHotspotInfo from "../../components/visitor/GroundHotspotInfo";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import {
  BaseHotspot,
  addHotspotsFromResponse,
  addHotspotPosition,
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  addNavigationHotspot,
  clearHotspot,
} from "../../redux/slices/HotspotSlice";
import CamControls from "../../components/visitor/CamControls";
import { goToStep } from "../../redux/slices/StepSlice";
import RightMenuCreateTour from "../../components/admin/RightMenuCT";
import TaskContainerCT from "../../components/admin/TaskContainerCT";
import UpdateHotspot from "../../components/admin/taskCreateTourList/UpdateHotspot";
import { useSequentialTasks } from "../../hooks/useSequentialTasks";
import { tasks } from "../admin/CreateTourStep2";
import { IoMdMenu } from "react-icons/io";
import {
  isInteger,
  NodeExpandResponse,
  NodeResponse,
  TourNodeRequestMapper,
} from "../../utils/TourNodeRequestMapper";
import {
  addPanoramasFromResponse,
  clearPanorama,
  PanoramaItem,
  selectPanorama,
  setSpaceId,
} from "../../redux/slices/PanoramaSlice";
import { Environment } from "@react-three/drei";
import {
  getFilteredHotspotInformationInList,
  getFilteredHotspotMediaInList,
  getFilteredHotspotModelInList,
  getFilteredHotspotNavigationInList,
  getHotspotLinkMap,
} from "../../redux/slices/Selectors";
import { AnimatePresence, motion } from "framer-motion";
import Task1 from "../../components/admin/taskCreateTourList/Task1DisplayInfo";
import Task2 from "../../components/admin/taskCreateTourList/Task2BasicConfig";
import MiniMap from "../../components/Minimap";
import { useImageCache } from "../../contexts/ImageCacheContext";
import { buildImageUrlWithQuality } from "../../utils/getCloudinaryURL";
import { FaAngleDoubleUp } from "react-icons/fa";
import Task3 from "../../components/admin/taskCreateTourList/Task3AddHotspot";
import { diffNode } from "../../utils/DiffNodeForUpdate";
import _Draggable from "gsap/Draggable";
import { IoWarning } from "react-icons/io5";
import { CiWarning } from "react-icons/ci";
import { IoReturnDownBack } from "react-icons/io5";

/**
 * Data đại diện của MasterNodeId có thêm:
 * 1. updatedAt : Ngày cập nhật
 */
export interface PanoramaItemExpandField extends PanoramaItem {
  userId: string;
  fieldId: string;
  numView: number;
  updatedAt: number;
}

const TourDetail = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const imageRef = useImageCache();

  const { nodeId } = useParams<{ nodeId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  //Redux
  const comments = useSelector((state: RootState) => state.data.commentOfNode);
  const userId = useSelector((state: RootState) => state.auth.user.id);

  //Version of Kien
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const currentTour = panoramaList.find((p) => p.id == nodeId);

  //Sử dụng trên overview chỉnh thông tin.
  const currentNodeView = panoramaList.find((p) => p.id == currentSelectId); //Sử dụng để sửa thông tin.

  const [originalResponse, setOriginalResponse] = useState<
    NodeResponse[] | NodeExpandResponse[]
  >([]);
  const [originalMasterNode, setOriginalMasterNode] =
    useState<PanoramaItemExpandField | null>(null);

  //Version of Kien  end

  // const [node, setNode] = useState<any>(); Version of Quy

  const [isOpenComment, setIsOpenComment] = useState(false);
  const [isUpdateTour, setIsUpdateTour] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(null);
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const navigate = useNavigate();
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null); //OrbitControls
  /**
   * Logic create tour step 2 of admin
   * dùng để nhận giá trị trả về từ OptionHotspot.tsx để update cho đúng hotspot
   */
  const [currentHotspotId, setCurrentHotspotId] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [preTaskIndex, setPreTaskIndex] = useState<number | null>(null);
  const [assignable, setAssignable] = useState(false);
  const [currentHotspotType, setCurrentHotspotType] = useState(1);
  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null); //test

  const { openTaskIndex, completedTaskIds, unlockedTaskIds, handleOpenTask } =
    useSequentialTasks(tasks.length);

  const hotspotPosition = useSelector(
    (state: RootState) => state.hotspots.hotspotPositions
  );
  const [validIcon, setValidIcon] = useState(true);
  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);
  const [cameraAngle, setCameraAngle] = useState(0);
  const [isTextureReady, setIsTextureReady] = useState(false);
  const [isValidated, setIsValidated] = useState(true);
  const [isOpenFeedback, setIsOpenFeedback] = useState(true);

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
  // const currentNodeViewUrl =
  //   imageRef.current[currentNodeView?.url ?? ""]?.objectUrl ??
  //   currentNodeView?.url ??
  //   "/khoa.jpg";

  const handleOpenMenu = () => {
    setIsMenuVisible((preState) => !preState);
  };
  const handleOnPropsChange = (updatedProps: BaseHotspot) => {
    setBasicProps(updatedProps);
  };
  /**
   *  Xử lý đổi nội dung content cho từng task (1,2,3) áp dụng trên TaskContainerCT từ RightMenuCT.
   */
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
            <Task2 cameraRef={cameraRef} controlsRef={controlsRef} />
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
  /**
   * end logc update tour step 2
   */

  const hotspots = useSelector((state: RootState) => state.hotspots);

  useEffect(() => {
    dispatch(goToStep(2));
    dispatch(fetchIcons());
    dispatch(fetchHotspotTypes());
  }, [dispatch]);

  const hotspotNavigations = useSelector(getFilteredHotspotNavigationInList);
  const hotspotInformations = useSelector(getFilteredHotspotInformationInList);
  const hotspotModels = useSelector(getFilteredHotspotModelInList);
  const hotspotMedias = useSelector(getFilteredHotspotMediaInList);

  useEffect(() => {
    if (!nodeId) return;

    axios
      .post(API_URLS.GET_FULL_TOUR, {
        nodeId: Number(nodeId),
      })
      .then((resp) => {
        const nodes: NodeExpandResponse[] = resp.data.data;
        setOriginalResponse(nodes); //Bản gốc

        // Tìm ra node đại diện
        const mainNode = nodes.find((node) => node.id == nodeId);
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
        };
        setOriginalMasterNode(currentTourExpandField);

        //Logic preload ảnh vào ram. Dùng url làm key.
        nodes.forEach((node) => {
          if (!node.url || imageRef.current[node.url]) return;

          const highResURL = buildImageUrlWithQuality(node.url, "8K");

          fetch(highResURL, { mode: "cors" })
            .then((res) => res.blob())
            .then((blob) => {
              const objectUrl = URL.createObjectURL(blob);
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = objectUrl;

              img.onload = () => {
                imageRef.current[node.url] = {
                  img,
                  objectUrl,
                  quality: "8K",
                  lastUsed: Date.now(),
                };
              };
            })
            .catch((err) => {
              console.warn(
                "⚠️ Không preload được ảnh 360 cho node:",
                node.id,
                err
              );
            });
        });
      })
      .catch((err) => {
        console.warn("Lỗi không lấy được node", err);
      });
  }, [nodeId, dispatch]);

  const handleSendComment = async () => {
    if (!content.trim()) return;

    try {
      const response = await axios.post(API_URLS.SEND_COMMENT, {
        userId: user.id,
        nodeId: nodeId,
        parentId: parentId,
        content: content,
      });
      if (response.data.data) {
        setContent("");
        // dispatch(fetchCommentOfNode(node.id)); //version of Quy
        dispatch(fetchCommentOfNode(currentNodeView.id)); //version of Kien
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };

  /**
   * LOGIC phần cập nhật Tour.
   * Quy chuẩn cho hotspot & panos về cùng 1 dạng.
   * Dạng 1 : Create - Tạo mới
   * + ID: Dạng không parse thành int được.
   * => Insert hàng mới.
   * Dạng 2: Update - Cập nhật
   * + ID: Parse về được giống với response.
   * + Thay đổi 1 vài dòng => PATCH.
   * Dạng 3: Delete - Xoá
   * + ID: Biến mất so với response lấy lên
   * + Thay đổi status về 0 => PATCH.
   * @returns
   */

  const handleUpdateTour = async () => {
    if (panoramaList.length === 0) {
      Swal.fire({
        title: "Không thể cập nhật",
        text: "Danh sách ảnh của bạn đang rỗng, không thể cập nhật!",
        icon: "warning",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    if (!isFullConnected) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng kiểm tra lại các điểm tương tác đến các ảnh trong cùng tour!",
        toast: true,
        position: "top-end",
        showConfirmButton: true,
        timer: 3000,
      });
      return;
    }
    try {
      //Step1: Mapping dữ liệu Redux với API backend:
      //1. Panorama mới : map thành createNodeRequest.
      //2. Panorama cũ : map về oneNodeUpdateRequest.

      //Lọc danh sách panorama mới:
      const createPanoramas = panoramaList.filter((p) => !isInteger(p.id));

      const createPanoramasId = new Set(createPanoramas.map((p) => p.id));

      const hotspotsOfCreatePanoramas = hotspots.hotspotList.filter((h) =>
        createPanoramasId.has(h.nodeId)
      );
      const updatePanoramas = panoramaList.filter((p) => isInteger(p.id));
      const updateHotspots = hotspots.hotspotList.filter(
        (h) => !createPanoramasId.has(h.nodeId)
      );

      const payloadCreate = TourNodeRequestMapper.mapOneNodeCreateRequest(
        createPanoramas,
        hotspotsOfCreatePanoramas,
        userId
      );

      const payloadUpdate = TourNodeRequestMapper.mapOneNodeUpdateRequest(
        updatePanoramas,
        updateHotspots
      );
      //Step2: Là lúc check với thằng diff rồi.
      const diff = diffNode(originalResponse, payloadUpdate);

      const finalPayload = {
        toCreate: payloadCreate,
        toUpdate: diff.toUpdate,
        toDelete: diff.toDelete,
      };

      // Step2: Gửi lên backend
      const response = await axios.post(
        API_URLS.ADMIN_UPDATE_NODES,
        finalPayload
      );
      if (response.data.data) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thành công",
        }).then(() => {
          setIsUpdateTour(false);
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

  const linkMap = useSelector(getHotspotLinkMap); // Lấy ra được 1 tập hợp Map.
  const panoramaSubItemIds = panoramaList
    .filter((p) => p.config.status === 1)
    .map((p) => p.id);

  const isFullConnected = useMemo(() => {
    if (!currentTour || !linkMap.has(currentTour.id)) return false;

    // Master phải trỏ đến tất cả slave
    const fromMaster = linkMap.get(currentTour.id) ?? new Set();
    const toAllSlaves = panoramaSubItemIds.every((pId) => fromMaster.has(pId));

    // Mỗi slave phải có hotspot trỏ ngược về master
    const allSlavesPointBack = panoramaSubItemIds.every((pId) => {
      const links = linkMap.get(pId);
      return links?.has(currentTour.id);
    });

    return toAllSlaves && allSlavesPointBack;
  }, [linkMap, currentTour, panoramaSubItemIds]);

  useEffect(() => {
    dispatch(fetchCommentOfNode(parseInt(nodeId || "", 10)));
  }, [dispatch]);

  const handleChangeStatus = async (node: any) => {
    if (node.config.status == 2) {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn",
        text: "Việc ngưng hoạt động có thể ảnh hưởng tới các node khác",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });
      if (!result.isConfirmed) {
        return;
      }
    }

    const response = await axios.post(API_URLS.CHANGE_NODE_STATUS, {
      id: node.id,
      status: node.status,
    });
    alert(node.config.status);
    if (response.data.data) {
      Swal.fire({
        title: "Thành công",
        text: `${
          node.config.status == 0 ? "Mở hoạt động" : "Ngưng hoạt động"
        } thành công`,
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      // handleFetchNode(node.id);  --- Version of Quy 1.3
    } else {
      Swal.fire({
        title: "Thất bại",
        text: "Đổi trạng thái thất bại",
        icon: "error",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
  };

  const handleRemove = async (node: any) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn",
      text: "Việc xóa node sẽ không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) {
      return;
    }

    const response = await axios.post(API_URLS.REMOVE_NODE, {
      nodeId: node.id,
    });
    if (response.data.data) {
      Swal.fire({
        title: "Thành công",
        text: "Node đã được xóa thành công",
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      navigate("/manage/tours");
    } else {
      Swal.fire({
        title: "Thất bại",
        text: "Xóa node thất bại. Vui lòng thử lại sau.",
        icon: "error",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
  };

  const handleSelectNode = (nodeId: string) => {
    dispatch(selectPanorama(nodeId));
    // handleFetchNode(nodeId || ""); ---- version of quy 1.4
    setCurrentHotspotId(null);
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

  const handleHotspotNavigate = (
    targetNodeId: string,
    hotspotTargetPosition: [number, number, number]
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;

    // === Bước 2: Zoom vào
    handleSelectNode(targetNodeId);
  };

  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    if (!currentNodeView) return;
    if (currentNodeView.config.status == 4) {
      setIsUpdateTour(true);
      const fetchFeedback = async () => {
        try {
          const response = await axios.post(
            `${API_URLS.GET_FEEDBACK_BY_NODE_ID}`,
            {
              nodeId: currentNodeView.id,
            }
          );
          const data = response.data.data;
          if (data) {
            const feedbacks = JSON.parse(data.feedbackList) as string[];
            const feedback = {
              feedbackList: feedbacks,
              moreFeedback: data.moreFeedback,
              createdAt: formatTimeAgo(data.createdAt),
            };
            setFeedback(feedback);
          } else {
            setFeedback(null);
          }
        } catch (error) {
          console.error("Lỗi khi lấy phản hồi:", error);
        }
      };
      fetchFeedback();
    }
  }, [currentNodeView]);

  // Version of quy

  // Version of Kien
  if (!currentTour || !comments) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.canvas_container}>
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 0, DEFAULT_ORIGINAL_Z],
          }}
          className={styles.tourCanvas}
        >
          <Environment preset="studio" background={false} />
          <axesHelper args={[10]} position={[0, -90, 0]} />
          <UpdateCameraOnResize />
          <TourScene
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            imageRef={imageRef}
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

          {currentNodeView &&
            isUpdateTour &&
            !(
              currentNodeView.config.status === 2 &&
              currentNodeView.id !== nodeId
            ) && (
              <MiniMap
                currentPanorama={currentNodeView}
                angleCurrent={cameraAngle}
                currentTour={nodeId}
                locked={false}
              />
            )}

          <CamControls
            controlsRef={controlsRef}
            targetPosition={targetPosition}
            cameraRef={cameraRef}
            sphereRef={sphereRef}
            autoRotate={currentNodeView.isRotation}
            autoRotateSpeed={
              currentNodeView || currentNodeView.speedRotate == 0
                ? 0.2
                : currentNodeView.speedRotate
            }
            onAngleChange={(angle) => {
              setCameraAngle(angle); // cameraAngle luôn là góc thật tại thời điểm hiện tại (0–360)
            }}
          />

          {isUpdateTour && (
            <>
              <Suspense fallback={null}>
                {isTextureReady &&
                  hotspotInformations
                    .filter(
                      (hotspot) =>
                        // hotspot.nodeId == node.id && hotspot.status == 1 //Version of Quy
                        hotspot.nodeId == currentNodeView.id &&
                        hotspot.status == 1 //Version of Kien
                    )
                    .map((hotspot) => (
                      <GroundHotspotInfo
                        key={hotspot.id}
                        hotspotInfo={hotspot}
                        setCurrentHotspotId={setCurrentHotspotId}
                      />
                    ))}
              </Suspense>

              <Suspense fallback={null}>
                {isTextureReady &&
                  hotspotNavigations
                    .filter(
                      (hotspot) =>
                        hotspot.nodeId == currentNodeView.id &&
                        hotspot.status == 1 //Version of Kien
                    )
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
              </Suspense>

              <Suspense fallback={null}>
                {isTextureReady &&
                  hotspotModels
                    .filter(
                      (hotspot) =>
                        // hotspot.nodeId == node.id && hotspot.status == 1 // version of Quy
                        hotspot.nodeId == currentNodeView.id &&
                        hotspot.status == 1 // version of Kien
                    )
                    .map((hotspot) => (
                      <GroundHotspotModel
                        key={hotspot.id}
                        hotspotModel={hotspot}
                        setCurrentHotspotId={setCurrentHotspotId}
                      />
                    ))}
              </Suspense>

              <Suspense fallback={null}>
                {isTextureReady &&
                  hotspotMedias
                    .filter(
                      (hotspot) =>
                        // hotspot.nodeId == node.id && hotspot.status == 1 // version of Quy
                        hotspot.nodeId == currentNodeView.id &&
                        hotspot.status == 1 // version of Kien
                    )
                    .map((hotspot) => (
                      <VideoMeshComponent
                        key={hotspot.id}
                        hotspotMedia={hotspot}
                        setCurrentHotspotId={setCurrentHotspotId}
                      />
                    ))}
              </Suspense>
            </>
          )}
        </Canvas>

        {currentNodeView.config.status == 3 ||
        currentNodeView.config.status == 4 ? (
          ""
        ) : isFullPreview || isUpdateTour ? (
          <span className={styles.toggle_open_feature}>
            <FaAngleDoubleUp
              // className={styles.toggle_features}
              title={"Mở tính năng"}
              onClick={() => {
                setIsFullPreview(false);
                setIsUpdateTour(false);
              }}
            />
          </span>
        ) : (
          <div className={styles.feature_container}>
            <div className={styles.info}>
              <div className={styles.sub_info}>
                <span className={styles.name}>Cập nhật</span>
                <span className={styles.des}>
                  {/* {formatTimeAgo(node.updatedAt)}  */}
                  {originalMasterNode?.updatedAt
                    ? formatTimeAgo(originalMasterNode?.updatedAt)
                    : ""}
                </span>
              </div>
              <div className={styles.sub_info}>
                <span className={styles.name}>Trạng thái</span>
                <span className={styles.des}>
                  {/* getStatusText */}
                  {getStatusNode(currentTour.config.status)}
                </span>
              </div>
              <div className={styles.sub_info}>
                <span className={styles.name}>{comments.length}</span>
                <span className={styles.des}>Số bình luận</span>
              </div>
              <div className={styles.sub_info}>
                <span className={styles.name}>
                  {originalMasterNode?.numView ?? 0}
                </span>
                {/* <span className={styles.name}>{node.numView}</span> */}
                <span className={styles.des}>Số lượt truy cập</span>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.title}>Tính năng</span>
              <ul className={styles.featureList}>
                {/* <li onClick={() => handleChangeStatus(node)}>
                  {node.status == 2 ? "Ngưng hoạt động" : "Mở hoạt động"}
                </li> */}
                {/* <li onClick={() => handleRemove(node)}>Xóa tour</li> */}
                <li onClick={() => handleChangeStatus(currentTour)}>
                  {currentTour.config.status == 2
                    ? "Ngưng hoạt động"
                    : "Mở hoạt động"}
                </li>
                <li onClick={() => handleRemove(currentTour)}>Xóa tour</li>
                <li onClick={() => setIsUpdateTour(true)}>Cập nhật tour</li>
                <li onClick={() => setIsFullPreview((pre) => !pre)}>
                  Chế độ xem toàn cảnh
                </li>
                <li onClick={() => setIsOpenComment((pre) => !pre)}>
                  Xem bình luận
                </li>
              </ul>
            </div>
          </div>
        )}
        {/* Hộp bình luận */}
        <div
          className={`${styles.commentContainer} ${
            isOpenComment ? styles.show : ""
          }`}
        >
          {isOpenComment ? (
            <>
              <div className={styles.commentBox}>
                {comments.map((comment: any) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.content}>
                      {comment.content}
                      <button className={styles.replyBtn}>Trả lời</button>
                    </div>
                    <div className={styles.meta}>
                      <small>{formatTimeAgo(comment.updatedAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.inputContainer}>
                <textarea
                  placeholder="Nhập bình luận..."
                  className={styles.textarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <button className={styles.sendBtn} onClick={handleSendComment}>
                  Gửi
                </button>
              </div>
            </>
          ) : (
            ""
          )}
        </div>

        {isUpdateTour && (
          <>
            {currentNodeView.config.status === 2 &&
            currentNodeView.id !== nodeId ? (
              <button
                className={styles.cancel_update_btn}
                onClick={() => {
                  if (nodeId) handleSelectNode(nodeId);
                }}
              >
                Quay về tour hiện tại <IoReturnDownBack />
              </button>
            ) : (
              <>
                <div className={styles.toggle_right_menu}>
                  <IoMdMenu
                    className={styles.show_menu}
                    onClick={handleOpenMenu}
                  />
                </div>

                <AnimatePresence>
                  {isMenuVisible && (
                    <motion.div
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className={stylesRightMenu.rightMenu}
                    >
                      <div className={stylesRightMenu.rightTitle}>
                        <FaAngleRight
                          className={stylesRightMenu.close_menu_btn}
                          onClick={handleOpenMenu}
                        />
                        <h2>Cấu hình</h2>
                      </div>

                      <RightMenuCreateTour
                        tasks={tasks}
                        openTaskIndex={openTaskIndex}
                        onTaskClick={handleOpenTask}
                        setPreOpenTask={setPreTaskIndex}
                        isUpdateTour={true}
                        handleUpdateTour={handleUpdateTour}
                        saveLinkNode={false}
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
                        className={stylesRightMenu.task_container}
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
                      initial={{ y: 800, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 800, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className={stylesRightMenu.update_hotspot_container}
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TourDetail;
