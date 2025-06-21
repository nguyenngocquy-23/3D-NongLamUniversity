import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/visitor/tourDetail.module.css";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FaAngleRight, FaAngleUp, FaComment, FaEye } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import {
  fetchCommentOfNode,
  fetchHotspotTypes,
  fetchIcons,
  fetchMasterNodes,
  fetchPreloadNodes,
} from "../../redux/slices/DataSlice";
import { formatTimeAgo } from "../../utils/formatDateTime";
import Swal from "sweetalert2";
import { API_URLS } from "../../env";
import VideoMeshComponent from "../../components/admin/VideoMesh";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import GroundHotspotInfo from "../../components/visitor/GroundHotspotInfo";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import {
  HotspotModel,
  HotspotMedia,
  HotspotNavigation,
  HotspotInformation,
  BaseHotspot,
  addHotspotsFromResponse,
} from "../../redux/slices/HotspotSlice";
import CamControls from "../../components/visitor/CamControls";
import { goToStep } from "../../redux/slices/StepSlice";
import RightMenuCreateTour from "../../components/admin/RightMenuCT";
import TaskContainerCT from "../../components/admin/TaskContainerCT";
import UpdateHotspot from "../../components/admin/taskCreateTourList/UpdateHotspot";
import { useSequentialTasks } from "../../hooks/useSequentialTasks";
import { tasks } from "../admin/CreateTourStep2";
import { IoMdMenu } from "react-icons/io";
import TaskUpdate1 from "../../components/admin/taskCreateTourList/Task1UpdateInfo";
import TaskUpdate2 from "../../components/admin/taskCreateTourList/Task2UpdateConfig";
import TaskUpdate3 from "../../components/admin/taskCreateTourList/Task3UpdateHotspot";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper";
import {
  addPanoramasFromResponse,
  selectPanorama,
} from "../../redux/slices/PanoramaSlice";

const TourDetail = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const { nodeId } = useParams<{ nodeId: string }>();
  const [node, setNode] = useState<any>();
  const comments = useSelector((state: RootState) => state.data.commentOfNode);
  const dispatch = useDispatch<AppDispatch>();
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
  const { openTaskIndex, completedTaskIds, unlockedTaskIds, handleOpenTask } =
    useSequentialTasks(tasks.length);

  const cameraRadarRef = useRef<number>(0);

  useEffect(() => {
    if (nodeId) {
      console.log("Fetching preload nodes for nodeId:", nodeId);
      dispatch(fetchPreloadNodes(Number.parseInt(nodeId)));
    }
  }, [nodeId]);

  const preloadNodes = useSelector(
    (state: RootState) => state.data.preloadNodes
  );

  useEffect(() => {
    if (preloadNodes && node) {
      const nodes = [node, ...preloadNodes];
      const { panoramaList, hotspotList } =
        TourNodeRequestMapper.mapToPanoramaAndHotspots(nodes);

      dispatch(addPanoramasFromResponse(panoramaList));
      dispatch(addHotspotsFromResponse(hotspotList));
    }
  }, [preloadNodes, node, dispatch]);

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
            <TaskUpdate1 />
          </>
        );
      case 2:
        return (
          <>
            <TaskUpdate2 cameraRef={cameraRef} />
          </>
        );
      case 3:
        return (
          <>
            <TaskUpdate3
              isAssignable={assignable}
              setAssignable={setAssignable}
              setCurrentHotspotType={setCurrentHotspotType}
              onPropsChange={handleOnPropsChange}
              currentPanorama={node}
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

  /**
   * Cho update tour same step3
   */
  const panoramas = useSelector((state: RootState) => state.panoramas);
  const hotspots = useSelector((state: RootState) => state.hotspots);

  useEffect(() => {
    dispatch(goToStep(2));
    dispatch(fetchIcons());
    dispatch(fetchHotspotTypes());
  }, [dispatch]);

  const hotspotNavigations = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotNavigation => hotspot.type === 1
    )
  );
  const hotspotInformations = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotInformation => hotspot.type === 2
    )
  );
  const hotspotModels = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotModel => hotspot.type === 4
    )
  );

  const hotspotMedias = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotMedia => hotspot.type === 3
    )
  );

  const handleFetchNode = async () => {
    if (!nodeId) {
      console.warn("Missing nodeId from URL");
      return;
    }
    try {
      const response = await axios.post(API_URLS.NODE_BY_ID, {
        nodeId: nodeId,
      });
      if (response.data) {
        setNode(response.data.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

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
        dispatch(fetchCommentOfNode(node.id));
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };

  const handleUpdateTour = async () => {
    console.log("handleUpdateTour called");
    const { panoramaList } = panoramas;

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
          text: "Xuất bản thành công",
        }).then(() => {
          // dispatch(nextStep());
          dispatch(fetchMasterNodes());
        });
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

  useEffect(() => {
    handleFetchNode();
  }, [nodeId]);

  useEffect(() => {
    dispatch(fetchCommentOfNode(parseInt(nodeId || "", 10)));
  }, [dispatch]);

  if (!node || !comments) {
    return null;
  }

  const handleChangeStatus = async (node: any) => {
    if (node.status == 2) {
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
    if (response.data.data) {
      Swal.fire({
        title: "Thành công",
        text: `${
          node.status == 0 ? "Mở hoạt động" : "Ngưng hoạt động"
        } thành công`,
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      handleFetchNode();
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

  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
    setCurrentHotspotId(null);
  };

  const handleHotspotNavigate = (
    targetNodeId: string,
    hotspotTargetPosition: [number, number, number]
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const control = controlsRef.current;
    const originalFov = camera.fov;
    const zoomTarget = 45;

    const [x, y, z] = hotspotTargetPosition;

    // === Bước 1: Tạo điểm cần nhìn đến (hotspot)
    const targetLookAt = new THREE.Vector3(x, 0, z);

    // === Bước 2: Animation tạm thời "quay" camera bằng cách move lookAt
    const tempTarget = targetLookAt.clone();

    gsap.to(camera.rotation, {
      duration: 0.2,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(tempTarget);
        control.update();
      },
      onComplete: () => {
        gsap.to(camera, {
          fov: zoomTarget,
          duration: 1.0,
          ease: "power2.inOut",
          onUpdate: () => {
            handleSelectNode(node.id);
            camera.updateProjectionMatrix();
          },
          onComplete: () => {
            camera.fov = originalFov;
            camera.lookAt(0, 0, 0); // về
            camera.updateProjectionMatrix();
            control.update();
          },
        });
      },
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.canvas_container}>
        <Canvas
          camera={{
            fov: 75,
            // aspect: windowSize.width / windowSize.height,
            near: 0.1,
            far: 1000,
            position: [0, 0, 0.0000001],
          }}
          className={styles.tourCanvas}
          // style={{ cursor }}
        >
          <UpdateCameraOnResize />
          <TourScene
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            textureCurrent={node.url}
            lightIntensity={1}
          />
          <CamControls
            controlsRef={controlsRef}
            targetPosition={[node.positionX, node.positionY, node.positionZ]}
            cameraRef={cameraRef}
            sphereRef={sphereRef}
            autoRotate={node.isRotation}
            autoRotateSpeed={
              node || node.speedRotate == 0 ? 0.2 : node.speedRotate
            }
            cameraRadarRef={cameraRadarRef}
            currentPano={node}
          />
          {isUpdateTour && (
            <>
              {hotspotInformations
                .filter((hotspot) => hotspot.nodeId == nodeId)
                .map((hotspot) => (
                  <GroundHotspotInfo
                    key={hotspot.id}
                    hotspotInfo={hotspot}
                    setCurrentHotspotId={setCurrentHotspotId}
                  />
                ))}
              {hotspotNavigations
                .filter((hotspot) => hotspot.nodeId == nodeId)
                .map((hotspot) => (
                  <GroundHotspot
                    key={hotspot.id}
                    onNavigate={(targetNodeId, cameraTargetPosition) =>
                      handleHotspotNavigate(targetNodeId, cameraTargetPosition)
                    }
                    hotspotNavigation={hotspot}
                    setCurrentHotspotId={setCurrentHotspotId}
                  />
                ))}
              {hotspotModels
                .filter((hotspot) => hotspot.nodeId == nodeId)
                .map((hotspot) => (
                  <GroundHotspotModel
                    key={hotspot.id}
                    hotspotModel={hotspot}
                    setCurrentHotspotId={setCurrentHotspotId}
                  />
                ))}
              {hotspotMedias
                .filter((hotspot) => hotspot.nodeId == nodeId)
                .map((hotspot) => (
                  <VideoMeshComponent
                    key={hotspot.id}
                    hotspotMedia={hotspot}
                    setCurrentHotspotId={setCurrentHotspotId}
                  />
                ))}
            </>
          )}
        </Canvas>
        {node.status == 3 ? (
          ""
        ) : isFullPreview || isUpdateTour ? (
          <FaAngleUp
            className={styles.toggle}
            title={"Mở tính năng"}
            onClick={() => {
              setIsFullPreview(false);
              setIsUpdateTour(false);
            }}
          />
        ) : (
          <div>
            <div className={styles.info}>
              <div className={styles.sub_info}>
                <span className={styles.name}>Cập nhật</span>
                <span className={styles.des}>
                  {formatTimeAgo(node.updatedAt)}
                </span>
              </div>
              <div className={styles.sub_info}>
                <span className={styles.name}>Trạng thái</span>
                <span className={styles.des}>
                  {node.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động"}
                </span>
              </div>
              <div className={styles.sub_info}>
                <span className={styles.name}>{comments.length}</span>
                <span className={styles.des}>Số bình luận</span>
              </div>
              <div className={styles.sub_info}>
                <span className={styles.name}>1000</span>
                <span className={styles.des}>Số lượt truy cập</span>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.title}>Tính năng</span>
              <ul className={styles.featureList}>
                <li onClick={() => handleChangeStatus(node)}>
                  {node.status == 2 ? "Ngưng hoạt động" : "Mở hoạt động"}
                </li>
                <li onClick={() => handleRemove(node)}>Xóa tour</li>
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
            <div className={styles.toggle_right_menu}>
              <IoMdMenu
                className={styles.show_menu}
                onClick={() => handleOpenMenu()}
              />
            </div>
            <div
              className={`${styles.rightMenu} ${
                isMenuVisible ? styles.show : ""
              }`}
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
                isUpdateTour={true}
                handleUpdateTour={handleUpdateTour}
                saveLinkNode={false}
              />
            </div>
            {/* tasks */}
            <div
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
            {/* Hộp chỉnh sửa hotspot */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default TourDetail;
