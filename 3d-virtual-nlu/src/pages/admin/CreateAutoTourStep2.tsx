import * as THREE from "three";
import { useState, useEffect, useRef, useMemo } from "react";
import styles from "../../styles/createTourStep2.module.css";
import { FaAngleLeft, FaAngleRight, FaBook, FaX } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Environment, Line } from "@react-three/drei";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel";
import {
  addAutoPanorama,
  clearAutoPanorama,
  clearPanorama,
  removeAutoPanorama,
  selectPanorama,
} from "../../redux/slices/PanoramaSlice";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import gsap from "gsap";

import {
  addHotspotPosition,
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  addNavigationHotspot,
  BaseHotspot,
  clearHotspot,
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice";
import GroundHotspot from "../../components/visitor/GroundHotspot";
import VideoMeshComponent from "../../components/admin/VideoMesh";
import GroundHotspotInfo from "../../components/visitor/GroundHotspotInfo";
import {
  goToStep,
  nextStep,
  prevStep,
  resetStep,
} from "../../redux/slices/StepSlice";
import Swal from "sweetalert2";
import { CREATE_TOUR_STEPS } from "../../features/CreateTour";
import MiniMap from "../../components/Minimap";
import {
  DEFAULT_ORIGINAL_Z,
  perPage,
  RADIUS_SPHERE,
} from "../../utils/Constants";
import CamControls from "../../components/visitor/CamControls";
import ConfigAutoTour from "../../components/admin/ConfigAutoTour";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URLS } from "../../env";
import {
  ApiResponse,
  CloudinaryUploadResp,
} from "../../components/admin/UploadFile";
import Waiting from "../../components/Waiting";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper";
import { fetchNodes } from "../../redux/slices/DataSlice";
import { transformUrlToThumbnailBig } from "../../utils/getCloudinaryURL";
import { FaQuestionCircle } from "react-icons/fa";

const CreateAutoTourStep2 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor
  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);
  const [openConfigTour, setOpenConfigTour] = useState(false);
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null);

  const { tourId } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);

  const nodes = useSelector((state: RootState) => state.data.nodes);
  const [isAddTour, setIsAddTour] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const dashboard = useSelector((state: RootState) => state.data.dashboard);
  const [totalNode, setTotalNode] = useState(0);
  const totalPages = Math.ceil(totalNode / perPage);

  useEffect(() => {
    if (dashboard) {
      setTotalNode(dashboard.numTour);
    }
  }, [dashboard]);

  const goPrev = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    dispatch(fetchNodes({ limit: perPage, page: currentPage - 1 }));
  }, [currentPage]);

  const goNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
    }
  };
  const [nodeList, setNodeList] = useState<any[]>(nodes || []);
  useEffect(() => {
    if (isAddTour) {
      dispatch(fetchNodes({ limit: perPage, page: currentPage - 1 }));
      setNodeList(nodes);
    }
  }, [isAddTour, dispatch]);

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setNodeList(nodes);
    }
  }, [nodes]);

  useEffect(() => {
    if (tourId) {
      setIsUpdate(true);
    }
  }, [tourId]);

  const autoNodes = useSelector((state: RootState) => state.data.autoNodes);

  // const [autoNode, setAutoNode] = useState(null);
  const [autoNode, setAutoNode] = useState<any>(
    autoNodes.find((node) => node.id === tourId)
  );

  useEffect(() => {
    if (tourId && autoNodes.length > 0) {
      const foundNode = autoNodes.find((node) => node.id == tourId);
      setAutoNode(foundNode);
    }
  }, [tourId, autoNodes]);

  useEffect(() => {
    if (autoNode?.status !== status) {
      setStatus(autoNode.status);
    }
  }, [autoNode]);

  const [status, setStatus] = useState(autoNode?.status); // State để điều khiển cursor

  const handleMouseDown = () => {
    setCursor("grabbing"); // Khi nhấn chuột, đổi cursor thành grabbing
  };

  const handleMouseUp = () => {
    setCursor("grab"); // Khi thả chuột, đổi cursor thành grab
  };

  /**
   * Khởi tạo sphereRef: sphere ban đầu của hình cầu.
   */
  // ========= REDUX ================
  const { autoPanoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const currentPanorama = useMemo(() => {
    return autoPanoramaList.find((pano) => pano.id === currentSelectId);
  }, [autoPanoramaList, currentSelectId]);

  const hotspotNavigations = useMemo(
    () =>
      currentPanorama?.navHotspots?.filter(
        (hotspot: any): hotspot is HotspotNavigation => hotspot.type === 1
      ) ?? [],
    [currentPanorama]
  );

  const hotspotInfos = useMemo(
    () =>
      currentPanorama?.infoHotspots?.filter(
        (hotspot: any): hotspot is HotspotInformation => hotspot.type === 2
      ) ?? [],
    [currentPanorama]
  );

  const hotspotModels = useMemo(
    () =>
      currentPanorama?.modelHotspots?.filter(
        (hotspot: any): hotspot is HotspotModel => hotspot.type === 4
      ) ?? [],
    [currentPanorama]
  );

  const hotspotMedias = useMemo(
    () =>
      currentPanorama?.mediaHotspots?.filter(
        (hotspot: any): hotspot is HotspotMedia => hotspot.type === 3
      ) ?? [],
    [currentPanorama]
  );

  const handleSelectNode = (id: string) => {
    setIsTextureReady(false);
    dispatch(selectPanorama(id));
    setCurrentHotspotId(null);
  };
  // ========= REDUX ================

  /**
   * Lấy URL panorama hiện tại - hoặc dùng mặc định.
   */
  const currentPanoramaUrl =
    currentPanorama?.url ?? `${import.meta.env.BASE_URL}khoa.jpg`;

  const {
    positionX = 0,
    positionY = 0,
    positionZ = DEFAULT_ORIGINAL_Z,
    lightIntensity = 1,
    autoRotate = 1,
    speedRotate = 0.2,
  } = currentPanorama?.config ?? {};

  const cameraPosition: [number, number, number] = [
    positionX,
    positionY,
    positionZ,
  ];

  const [basicProps, setBasicProps] = useState<BaseHotspot | null>(null);
  const [changeCornerMedia, setChangeCornerMedia] = useState(false);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = false; // tắt khi changeCornerMedia=true
    }
  }, [changeCornerMedia]);

  const handleOnPropsChange = (updatedProps: BaseHotspot) => {
    setBasicProps(updatedProps);
  };

  /**
   * dùng để nhận giá trị trả về từ OptionHotspot.tsx để update cho đúng hotspot
   */
  const [currentHotspotId, setCurrentHotspotId] = useState<string | null>(null);
  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  useEffect(() => {
    if (currentStep == 1) navigate("/admin/manageAutoTour");
  }, [currentStep, navigate]);

  const [cameraAngle, setCameraAngle] = useState(0);

  const [isTextureReady, setIsTextureReady] = useState(false);

  const uploadToCloud = async (soundUrl: string) => {
    const formData = new FormData();
    formData.append("file", soundUrl);
    const response = await axios.post<ApiResponse<CloudinaryUploadResp>>(
      API_URLS.UPLOAD_CLOUD,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data.url || "";
  };

  const [orderedList, setOrderedList] = useState(() =>
    autoPanoramaList.filter((p: any) => p.id != undefined).map((item) => ({ ...item }))
  );

  useEffect(() => {
    if (selectedNodes.length === 0) {
      const ids = orderedList.map((item) => item.id);
      setSelectedNodes(ids);
    }
  }, [orderedList]);

  // useEffect(() => {
  //   if (!autoPanoramaList || autoPanoramaList.length === 0) return;

  //   const currentIds = autoPanoramaList.map((i) => i.id);
  //   const prevIds = prevAutoListRef.current;

  //   const isSame =
  //     currentIds.length === prevIds.length &&
  //     currentIds.every((id, i) => id === prevIds[i]);

  //   if (!isSame) {
  //     prevAutoListRef.current = currentIds;
  //     const newList = autoPanoramaList.map((item) => ({ ...item }));
  //     console.log("Cập nhật orderedList:", newList);
  //     setOrderedList(newList);
  //   } else {
  //     console.log("Không thay đổi danh sách, không cập nhật.");
  //   }
  // }, [autoPanoramaList]);
  // useEffect(() => {
  //   if (!autoPanoramaList || autoPanoramaList.length === 0) return;

  //   const updatedOrderedList = orderedList.map((item) => {
  //     const matched = autoPanoramaList.find((a) => a.id === item.id);
  //     if (matched) {
  //       return {
  //         ...item,
  //         duration: matched.duration,
  //         soundBackground: matched.soundBackground ?? item.soundBackground,
  //       };
  //     }
  //     return item;
  //   });

  //   setOrderedList(updatedOrderedList);
  // }, [autoPanoramaList]);

  const prevAutoListRef = useRef<string[]>([]);

  useEffect(() => {
    if (!autoPanoramaList || autoPanoramaList.length === 0) return;

    const currentIds = autoPanoramaList.map((i) => i.id);
    const prevIds = prevAutoListRef.current;

    const isSame =
      currentIds.length === prevIds.length &&
      currentIds.every((id, i) => id === prevIds[i]);

    if (!isSame) {
      prevAutoListRef.current = currentIds;
      const newList = autoPanoramaList.map((item) => ({ ...item }));
      setOrderedList(newList);
      return;
    }

    // Nếu ID giống nhau, chỉ update duration / soundBackground
    setOrderedList((prev) =>
      prev.map((item) => {
        const matched = autoPanoramaList.find((a) => a.id === item.id);
        if (matched) {
          return {
            ...item,
            duration: matched.duration,
            soundBackground: matched.soundBackground ?? item.soundBackground,
          };
        }
        return item;
      })
    );
  }, [autoPanoramaList]);

  const handleIndexChange = (index1: number, index2: number) => {
    if (
      index1 < 0 ||
      index2 < 0 ||
      index1 >= orderedList.length ||
      index2 >= orderedList.length
    )
      return;

    const newList = [...orderedList];
    [newList[index1], newList[index2]] = [newList[index2], newList[index1]];
    setOrderedList(newList);
  };

  // Tạo mảng indexNode
  const indexNodeArray = orderedList
    .filter((p: any) => p.id != null) // lọc bỏ p.id null hoặc undefined
    .map((p: any) => ({
      nodeId: p.id,
      duration: p.duration,
    }));

  const handleUpdateAutoTour = async () => {
    Swal.fire({
      title: "Đang cập nhật...",
      showConfirmButton: false,
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      toast: true,
    });
    const tourName = `${orderedList[0]?.name || ""} - ${
      orderedList[orderedList.length - 1]?.name || ""
    }`;

    // Chuyển thành chuỗi JSON
    const indexNode = JSON.stringify(indexNodeArray);

    if (autoPanoramaList.length === 0) {
      alert("spaceId bị null hay panorama không chứa giá trị..");
      return;
    }

    const soundUrl = orderedList[0].soundBackground.includes("http")
      ? orderedList[0].soundBackground
      : await uploadToCloud(
          // autoPanoramaList.find((p) => p.soundBackground != "")?.soundBackground
          orderedList[0].soundBackground
        );
    try {
      const response = await axios.post(API_URLS.ADMIN_UPDATE_AUTO_TOUR, {
        autoTourId: tourId,
        name: tourName,
        indexNode: indexNode,
        status: status,
        soundBackground: soundUrl,
      });

      Swal.close();
      if (response.data?.statusCode === 1000) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thành công",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
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

  const handleToggleSelect = (nodeId: string) => {
    const node = nodeList.find((n) => n.id === nodeId);
    if (!node) return;

    setSelectedNodes((prevSelected) => {
      const isSelected = prevSelected.includes(nodeId);

      if (isSelected) {
        dispatch(removeAutoPanorama(nodeId));
        return prevSelected.filter((id) => id !== nodeId);
      } else {
        dispatch(addAutoPanorama({ node: node }));
        return [...prevSelected, nodeId];
      }
    });
  };

  const [isWaiting, setIsWaiting] = useState(true);
  const [percent, setPercent] = useState(0);
  const [isLoadingDone, setIsLoadingDone] = useState(false);

  useEffect(() => {
    if (
      !hotspotModels ||
      !hotspotMedias ||
      !hotspotNavigations ||
      !hotspotInfos
    ) {
      setIsLoadingDone(false);
      return;
    } else {
      setIsLoadingDone(true);
    }
  }, [
    hotspotModels.length,
    hotspotMedias.length,
    hotspotNavigations.length,
    hotspotInfos.length,
    isLoadingDone,
  ]);

  useEffect(() => {
    let progress = 0;

    const interval = setInterval(() => {
      if (!isLoadingDone) {
        // Loading giả lập, chỉ cho đến 90%
        if (progress < 90) {
          progress += Math.random() * 5; // tăng chậm lại để mượt
          if (progress > 90) progress = 90;
          setPercent(Math.floor(progress));
        }
      } else {
        // Task thật xong, tăng nốt phần còn lại đến 100%
        if (progress < 100) {
          progress += Math.random() * 10;
          if (progress > 100) progress = 100;
          setPercent(Math.floor(progress));
        }

        // Nếu đã 100% thì clear interval
        if (progress >= 100) {
          clearInterval(interval);
          requestAnimationFrame(() => {
            setTimeout(() => setIsWaiting(false), 500);
          });
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isLoadingDone]);

  const handleBackStep2 = () => {
    Swal.fire({
      icon: "question",
      title: "Bạn có chắc chắn muốn quay lại bước trước?",
      text: "Các thay đổi có thể chưa được lưu.",
      showCancelButton: true,
      confirmButtonText: "Quay lại",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearAutoPanorama());
        navigate(-1);
        dispatch(resetStep());
      }
    });
  };

  return (
    <>
      <div
        className={styles.previewTour}
        style={{ position: `${isUpdate ? "fixed" : "relative"}` }}
      >
        <Canvas
          camera={{
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000,
            position: cameraPosition,
          }}
          style={{ cursor: cursor }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
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
            textureCurrent={currentPanoramaUrl ?? "/khoa.jpg"}
            yawOffsetCurrent={currentPanorama?.yawOffset ?? 0}
            lightIntensity={lightIntensity}
            onTextureReady={() => setIsTextureReady(true)}
          />

          <CamControls
            targetPosition={targetPosition}
            sphereRef={sphereRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={speedRotate}
          />

          {isTextureReady &&
            hotspotNavigations
              .filter((hotspot: any) => hotspot.nodeId === currentSelectId)
              .map((hotspot: any) => (
                <GroundHotspot
                  key={hotspot.id}
                  onNavigate={() => {}}
                  setCurrentHotspotId={setCurrentHotspotId}
                  hotspotNavigation={hotspot}
                />
              ))}

          {isTextureReady &&
            hotspotInfos
              .filter((hotspot: any) => hotspot.nodeId === currentSelectId)
              .map((hotspot: any) => (
                <GroundHotspotInfo
                  key={hotspot.id}
                  setCurrentHotspotId={setCurrentHotspotId}
                  hotspotInfo={hotspot}
                />
              ))}
          {isTextureReady &&
            hotspotModels
              .filter((hotspot: any) => hotspot.nodeId === currentSelectId)
              .map((hotspot: any) => (
                <GroundHotspotModel
                  key={hotspot.id}
                  setCurrentHotspotId={setCurrentHotspotId}
                  hotspotModel={hotspot}
                />
              ))}

          {isTextureReady &&
            hotspotMedias
              .filter((hotspot: any) => hotspot.nodeId === currentSelectId)
              .map((hotspot: any) => (
                <VideoMeshComponent
                  key={hotspot.id}
                  hotspotMedia={hotspot}
                  setCurrentHotspotId={setCurrentHotspotId}
                />
              ))}

          {currentPoints.length > 1 &&
            currentPoints.map((point, i) => {
              if (i < currentPoints.length - 1)
                return (
                  <Line
                    key={i}
                    points={[point, currentPoints[i + 1]]}
                    color="cyan"
                  />
                );
              return null;
            })}
        </Canvas>

        {/* Header */}
        <div className={styles.header_tour}>
          <div className={styles.header_tour_left}>
            <FaAngleLeft
              className={styles.back_btn}
              onClick={() => {
                isUpdate ? handleBackStep2() : dispatch(resetStep());
              }}
            />
            <span>{CREATE_TOUR_STEPS[currentStep - 1].name}</span>
          </div>
          <span className={styles.number_step}>{currentStep}</span>
          <div className={styles.toggle_next_step_3}>
            {isUpdate && (
              <div className={styles.toggle_status}>
                <span>Trạng thái: </span>
                <button
                  style={{
                    marginRight: "1rem",
                    textAlign: "center",
                    padding: "0.5rem 1rem",
                    backgroundColor: status == 0 ? "#f0464fff" : "#267026",
                  }}
                  onClick={() => {
                    setStatus(status === 1 ? 0 : 1);
                  }}
                >
                  {status == 0 ? "Tạm ngưng" : "Hoạt động"}
                </button>
              </div>
            )}
            <button
              style={{
                marginRight: "1rem",
                textAlign: "center",
                padding: "0.5rem 1rem",
                backgroundColor: "#267026",
              }}
              onClick={() => {
                setIsAddTour(true);
              }}
            >
              Thêm/ xóa node
            </button>
            <button
              style={{
                marginRight: "1rem",
                textAlign: "center",
                padding: "0.5rem 1rem",
              }}
              onClick={() => {
                isUpdate ? handleUpdateAutoTour() : dispatch(nextStep());
              }}
            >
              {isUpdate ? "Cập nhật" : "Tiếp tục"}
            </button>
          </div>
        </div>
        {/* Hộp node */}
        <div className={styles.node_list}>
          {orderedList.filter((p: any) =>p.id != undefined).map((pano, index) => (
            <div
              key={pano.id}
              className={`${styles.node_item} ${
                currentSelectId === pano.id ? styles.active : ""
              }`}
              title={pano.name}
            >
              <img
                src={transformUrlToThumbnailBig(pano.url || "")}
                alt={pano.name}
                className={styles.node_image}
                onClick={() => {
                  setOpenConfigTour(pano.id);
                  handleSelectNode(pano.id);
                }}
              />
              <div className={styles.node_index_box}>
                <button
                  className={styles.node_index_button}
                  onClick={() => handleIndexChange(index, index - 1)}
                  disabled={index === 0}
                >
                  ▲
                </button>

                <span className={styles.node_index_value}>{index + 1}</span>

                <button
                  className={styles.node_index_button}
                  onClick={() => handleIndexChange(index, index + 1)}
                  disabled={index === orderedList.length - 1}
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Hướng dẫn sử dụng */}
        {!isUpdate && (
          <button className={styles.guide_button} title="Hướng dẫn">
            <FaBook />
          </button>
        )}
        {/* Hộp cấu hình tour */}
        {openConfigTour && (
          <div className={styles.config_tour}>
            <ConfigAutoTour
              orderedList={orderedList}
              setOpenConfigTour={setOpenConfigTour}
              soundBackgroundProp={autoNode?.soundBackground}
            />
          </div>
        )}
        {/* Hộp thêm tour */}
        {isAddTour && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.header}>
                <h2 className={styles.title}>
                  Danh sách node{" "}
                  <FaQuestionCircle
                    className={styles.guide_icon}
                    title="Các node có viền xanh là đã chọn. Nhấn vào để chọn hoặc bỏ chọn."
                  />
                </h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setIsAddTour(false)}
                >
                  <FaX />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <FaAngleLeft
                  onClick={goPrev}
                  className={`${styles.pagination_icon} ${
                    currentPage == 1 ? styles.disabled : ""
                  }`}
                />
                <div className={styles.node_container}>
                  {nodeList.length > 0 ? (
                    nodeList.map((node) => {
                      const isSelected = selectedNodes.includes(node.id);
                      return (
                        <div
                          key={node.id}
                          className={`${styles.tour} ${
                            isSelected ? styles.selected : ""
                          }`}
                          onClick={() => handleToggleSelect(node.id)}
                          style={{
                            backgroundImage: `url(${transformUrlToThumbnailBig(
                              node.url
                            )})`,
                          }}
                        >
                          <div className={styles.blur} />
                          <span className={styles.name}>{node.name}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.loading}>Đang tải...</div>
                  )}
                </div>
                <FaAngleRight
                  onClick={goNext}
                  className={`${styles.pagination_icon} ${
                    currentPage == totalPages ? styles.disabled : ""
                  }`}
                />
              </div>
            </div>
          </div>
        )}
        {isWaiting ? <Waiting percent={percent} /> : ""}
      </div>
    </>
  );
};

export default CreateAutoTourStep2;
