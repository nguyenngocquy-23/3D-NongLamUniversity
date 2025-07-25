import { Html } from "@react-three/drei";
import styles from "../styles/minimap.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import {
  addPanorama,
  deletePanoramaById,
  PanoramaItem,
  renameMasterAndUpdateSlaves,
  selectPanorama,
  setMasterPanorama,
  setSpaceId,
  updatePanoConfig,
} from "../redux/slices/PanoramaSlice";
import { RiEdit2Line } from "react-icons/ri";
import { MdAdsClick, MdClear, MdZoomInMap, MdZoomOutMap } from "react-icons/md";
import { getAngleFromXZ, getArcAnglesThree } from "../utils/MathUtils";
import {
  DEFAULT_ANGLE_RADAR,
  DEFAULT_ANGLE_THREE,
  MAX_QUANTITY_PANORAMA,
  RADIUS_MINIMAP_TOUR,
  RADIUS_SPHERE,
} from "../utils/Constants";
import { GiQueenCrown } from "react-icons/gi";
import { TiTick } from "react-icons/ti";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import TrackingNode from "./admin/minimap/TrackingNode";
import {
  getFilteredHotspotNavigationById,
  getFilteredHotspotNavigationOfMaster,
  getFilteredHotspotNavigations,
} from "../redux/slices/Selectors";
import {
  clearHotspotNavigation,
  deleteHotspotByNodeId,
  deleteHotspotHaveDatabase,
} from "../redux/slices/HotspotSlice";
import { FaSave } from "react-icons/fa";
import ImageSelect from "./SelectPanorama";
import { AnimatePresence, motion } from "framer-motion";
import { TbTournament } from "react-icons/tb";
import { useImageCache } from "../contexts/ImageCacheContext";
import { IoSettings } from "react-icons/io5";
import { FaLock, FaLockOpen, FaPlus } from "react-icons/fa6";
import Swal from "sweetalert2";
import UploadFile, {
  ApiResponse,
  CloudinaryUploadResp,
  FileUploadStatus,
} from "./admin/UploadFile";
import { isValidAspectRatio } from "../utils/ValidPanorama";
import axios, { AxiosError } from "axios";
import { API_URLS } from "../env";
import { buildImageUrlWithQuality } from "../utils/getCloudinaryURL";
import { isInteger } from "../utils/TourNodeRequestMapper";

type MiniMapProps = {
  currentPanorama: PanoramaItem;
  angleCurrent: number;
  currentTour?: string;
  locked?: boolean;
};
const MiniMap: React.FC<MiniMapProps> = ({
  currentPanorama,
  angleCurrent,
  currentTour,
  locked,
}) => {
  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
  };

  const handleSelectMasterNode = (nodeId: string) => {
    dispatch(setMasterPanorama(nodeId));
    dispatch(clearHotspotNavigation());
    setChooseMaster(false);
  };

  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus | null>(
    null
  );

  const [chooseMaster, setChooseMaster] = useState<boolean>(false);
  const handleChooseMaster = () => {
    setChooseMaster((p) => !p);
  };

  const deletePanoramaItem = (id: string) => {
    if (currentPanorama.id === id) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Node đang được hiển thị!",
        text: `Vui lòng di chuyển sang node mới trước khi xoá node này!`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
      return;
    }

    Swal.fire({
      title: "Hành động này sẽ không thể hoàn tác?",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const panorama = panoramaList.find((p) => p.id === id);
        if (panorama) {
          const url = panorama.url;
          const cache = imageRef.current[url];
          if (cache) {
            URL.revokeObjectURL(cache.objectUrl); //
            delete imageRef.current[url];
          }
        }

        Swal.fire("Xoá thành công!", "", "success");
        dispatch(deletePanoramaById(id));

        if (isInteger(id)) {
          dispatch(deleteHotspotHaveDatabase(id));
        } else {
          dispatch(deleteHotspotByNodeId(id));
        }
      }
    });
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const onChooseFile = () => {
    inputRef.current?.click();
  };

  const imageRef = useImageCache();

  const dispatch = useDispatch();

  const { panoramaList, spaceId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const filterPanoramaList = panoramaList.filter((p) => p.config.status !== 0);
  /** Filter ra các panos khác tour (Khi update)
   * + status = 2 # với node hiện tại.
   * + status = 0
   */
  const panaramaListInTour = currentTour
    ? filterPanoramaList.filter(
        (p) => p.config.status !== 2 || p.id == currentTour
      )
    : filterPanoramaList; //Filter ra các panos khác tour.

  const { spaces } = useSelector((state: RootState) => state.data);

  const spaceItem = spaces.find((s) => s.id === Number(spaceId));
  const hotspotNavigations = useSelector(getFilteredHotspotNavigations);

  const masterPanorama = panoramaList.find(
    (h) => h.config.status == 2 || h.config.status == 3
  );

  /**
   * Là danh sách các hostpot navigation từ Master Node.
   * - Đã có targetNodeId!
   */
  const hotspotFromMaster = useSelector(getFilteredHotspotNavigationOfMaster);

  // 1 angle1 lưu default và 1 angle2 xoay khác truyền vào radar
  // 2 angle đều duoc hiện ở camcontrol nhưng k set andle2 giá trị của angle1 để
  // hướng mặc định của radar là 310-50 -> angle?
  // angle1 dùng để lưu vào redux
  // control thay đổi thì thay đổi angle2 và truyền vào radar -> tính start/end angle
  // change camcontrol thì change angle2 -> angle2 dùng cho các node trên radar ( không qua tâm hướng mặc định của nó )
  // khi chuyển node sẽ set lại ref angle radar
  // nhận vào giá trị ban đầu, hướng lên, và khi đã có giá trị lần 2 thì các lần khác k cần
  // chia làm 2 tham chiếu ở lớp cha phân biệt hướng mặc định và hướng xoay.
  const { startSvg, endSvg } = getArcAnglesThree(
    DEFAULT_ANGLE_THREE,
    DEFAULT_ANGLE_RADAR,
    angleCurrent,
    100
  );

  // useEffect(() => {
  //   console.log("angleCurrent...", angleCurrent);
  // }, [angleCurrent]);

  /**
   *
   * @param cx : Vị trí tâm mới trên trục X của đường tròn so với gốc (East North) của thẻ div chứa.
   * @param cz  : Vị trí tâm mới trên trục Y  của đường tròn so với gốc (East North) của thẻ div chứa.
   * @param radius : Bán kính hình tròn vẽ (48<50), hình tròn sẽ nằm trọn trong thẻ div cha
   * @param startAngle : Toạ độ x,z của điểm bắt đầu cánh quạt (Lấy góc so với trục x dương)
   * @param endAngle : Toạ độ x,z của điểm kết thúc cánh quạt (Lấy góc so với trục x dương)
   * @returns 1 phần hình tròn: 1 phần quạt dạng radar.
   */

  function generateArcPath(
    cx: number,
    cz: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    const degToRad = (deg: number) => (deg * Math.PI) / 180;

    startAngle = ((startAngle % 360) + 360) % 360;
    endAngle = ((endAngle % 360) + 360) % 360;

    let delta = (endAngle - startAngle + 360) % 360;

    const largeArcFlag = delta > 180 ? 1 : 0;

    const start = {
      x: cx + radius * Math.cos(degToRad(startAngle)),
      z: cz + radius * Math.sin(degToRad(startAngle)),
    };
    const end = {
      x: cx + radius * Math.cos(degToRad(endAngle)),
      z: cz + radius * Math.sin(degToRad(endAngle)),
    };

    return `
    M ${cx} ${cz}
    L ${start.x} ${start.z}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.z}
    Z
  `;
  }

  /**
   *
   * @param id : targetNodeId được truyền vào
   * @returns panoramaTarget: node target.
   */
  const panoramaTargetUrl = (id: string) => {
    const panoramaTarget = panoramaList.find((pano) => pano.id === id);
    return (
      imageRef.current[panoramaTarget?.url]?.objectUrl || panoramaTarget?.url
    );
  };

  /**
   *
   * @param x : Toạ độ điểm x (hotspot positionX)
   * @param z : Toạ độ điểm x (hotspot positionX)
   * @param originR  : bán kính của hình cầu
   * @param targetR : bán kính của hình tròn radar
   * @returns  toạ độ x', y' tương ứng trong bán kính targetR
   */
  const scalePosition = (
    x: number,
    z: number,
    originR = RADIUS_SPHERE,
    targetR = RADIUS_MINIMAP_TOUR
  ) => {
    const scale = targetR / originR;
    return {
      x: 50 + x * scale, // dịch về tâm minimap (50, 50)
      y: 50 + z * scale,
    };
  };

  const getRadarPosition = (): { ctx: number; ctz: number } => {
    if (currentPanorama.config.status === 2) {
      return { ctx: 50, ctz: 50 };
    }

    /**
     * Lấy ra hotspot navigation có target (Điểm đến) là panorama đang hiển thị
     */
    const nodeItem = hotspotFromMaster.find(
      (item) => item.targetNodeId === currentPanorama.id
    );

    if (nodeItem?.positionX != null && nodeItem?.positionZ != null) {
      const { x, y } = scalePosition(nodeItem.positionX, nodeItem.positionZ);
      return { ctx: x, ctz: y };
    }
    return { ctx: 50, ctz: 50 };
  };

  const { ctx, ctz } = getRadarPosition();

  /**
   * Kiểm tra số lượng node của mỗi loại đã đủ chưa.
   * @param isMaster : Có phải là node master không
   * @param quantity : số lượng panorama đang có
   * @returns
   */

  const limitNavigation = (
    isMaster: boolean,
    quantity = panoramaList.length
  ) => {
    if (isMaster) return quantity - 1;
    return 1;
  };

  /**
   *
   * @param nodeId : nodeId là id của mỗi panorama truyền vào.
   * @returns danh sách cách hotspotNavigation của mỗi node:
   * 1. targetNodeId của nó phải có giá trị.
   * 2. hotspot của node đó hoặc hotspot trỏ đến node đó. (2 chiều)
   */
  const hotspotNavigationFromNode = (nodeId: string) => {
    const selector = getFilteredHotspotNavigationById(nodeId);
    return selector;
  };

  /**
   * Nếu nodeStatus = 2 (Master)
   * @param nodeId
   * @param nodeStatus
   * @returns
   */
  const checkFullhotspotNavigation = (nodeId: string, nodeStatus: number) => {
    const limit = 2 * limitNavigation(nodeStatus === 2);
    return hotspotNavigationFromNode(nodeId).length === limit;
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const handleZoomMap = () => {
    if (locked) return;
    setIsExpanded((prev) => !prev);
  };

  const handleSelectSpace = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setSpaceId(event.target.value));
  };
  const handleEditInput = () => {
    if (!isEditing) setIsEditing(true);
  };
  const handleRename = (name: string) => {
    if (!masterPanorama) return;

    const trimmedName = name.trim();
    if (!trimmedName) return; // tránh tên trống

    dispatch(
      renameMasterAndUpdateSlaves({
        id: masterPanorama.id,
        newName: trimmedName,
      })
    );
    setIsEditing(false);
  };
  const [masterNameInput, setMasterNameInput] = useState(
    masterPanorama?.config.name || ""
  );
  useEffect(() => {
    setMasterNameInput(masterPanorama?.config.name || "");
  }, [masterPanorama]);

  const options = panoramaList.map((p) => ({
    value: p.id,
    label: p.config.name,
    imageUrl: imageRef.current[p.url]?.objectUrl || p.url,
  }));

  /**
   * Kiểm tra file tải lên:
   * + Tỷ lệ 16:9.
   * + Chính xác có đuôi mong muốn
   *
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    const isValid = await isValidAspectRatio(newFile);

    if (!isValid) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng tải lên ảnh 360 đúng định dạng để tiếp tục",
        text: `Ảnh không có tỉ lệ 2:1 và sẽ bị loại.`,
        confirmButtonText: "Đồng ý",
      });
      return;
    }
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

          dispatch(
            addPanorama({
              originalFileName: item.originalFileName,
              url: item.url,
            })
          );

          const existing = imageRef.current[item.url];
          if (!existing || existing.quality !== "8K") {
            try {
              const highResURL = buildImageUrlWithQuality(item.url, "8K");
              const response = await fetch(highResURL, { mode: "cors" });
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);

              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = objectUrl;

              await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                  if (item.url) {
                    imageRef.current[item.url] = {
                      img,
                      objectUrl,
                      quality: "8K",
                      lastUsed: Date.now(),
                    };
                  }
                  resolve();
                };
                img.onerror = reject;
              });
            } catch (err) {
              console.warn("Không tải được ảnh 8K sau upload:", item.url, err);
            }
          }
        }
      } else {
        // Đánh dấu lỗi nếu server trả về lỗi

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

  return (
    <Html
      transform={false}
      occlude={false}
      fullscreen
      style={{
        pointerEvents: isExpanded ? "auto" : "none",
      }}
    >
      <div
        className={
          isExpanded ? styles.minimap_container_zoom : styles.minimap_container
        }
        style={{
          pointerEvents: "auto",
        }}
      >
        {!isExpanded && (
          <motion.div layoutId="minimap" className={styles.minimap_header}>
            {filterPanoramaList.map((item) => (
              <div key={item.id} className={styles.node}>
                <div
                  className={` ${styles.node_view}  ${
                    item.id === currentPanorama?.id ? styles.node_selected : ""
                  }`}
                  onClick={() => handleSelectNode(item.id)}
                >
                  <img
                    src={imageRef.current[item.url]?.objectUrl || item.url}
                    alt={item.config.name}
                    className={styles.thumbnail_node}
                  />
                  {checkFullhotspotNavigation(item.id, item.config.status) && (
                    <div className={styles.node_success}>
                      <TiTick className={styles.node_tick} />
                    </div>
                  )}
                  {[2, 3].includes(item.config.status) ? (
                    currentTour ? (
                      item.id !== currentTour ? (
                        <div className={styles.master_node_icon_container}>
                          <TbTournament className={styles.master_node_icon} />
                        </div>
                      ) : (
                        <div className={styles.master_node_icon_container}>
                          <GiQueenCrown className={styles.master_node_icon} />
                        </div>
                      )
                    ) : (
                      <div className={styles.master_node_icon_container}>
                        <GiQueenCrown className={styles.master_node_icon} />
                      </div>
                    )
                  ) : (
                    ""
                  )}
                  <span className={styles.node_name}>{item.config.name}</span>
                </div>
              </div>
            ))}
            <span className={styles.minimap_setting} onClick={handleZoomMap}>
              <IoSettings />
            </span>
          </motion.div>
        )}

        <div className={styles.minimap_preview_zoom}>
          <div
            className={
              isExpanded ? styles.minimap_content_zoom : styles.minimap_content
            }
          >
            <img
              src={
                imageRef.current[masterPanorama?.url]?.objectUrl ||
                masterPanorama?.url
              }
              alt="panorama_master"
              className={
                isExpanded ? styles.master_node_zoom : styles.master_node
              }
            />

            {hotspotFromMaster.map((item) => {
              const { x, y } = scalePosition(item.positionX, item.positionZ);
              return (
                <img
                  key={item.id}
                  src={panoramaTargetUrl(item.targetNodeId)}
                  alt="node"
                  className={
                    isExpanded ? styles.slave_node_zoom : styles.slave_node
                  }
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              );
            })}

            <div className={styles.rotation_node}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <path
                  d={generateArcPath(
                    ctx,
                    ctz,
                    RADIUS_MINIMAP_TOUR,
                    startSvg,
                    endSvg
                  )}
                  fill="rgba(255, 255, 255, 0.23)"
                />
              </svg>
            </div>
          </div>
        </div>
        {isExpanded && (
          <>
            <div className={styles.tour_settings}>
              <div
                className={`${styles.tour_general_information} ${styles.tour_general}`}
              >
                <div className={styles.tour_information_item}>
                  <span>
                    Lĩnh vực:{" "}
                    {spaceItem ? spaceItem.fieldName : "Không tìm thấy"}{" "}
                  </span>
                </div>
                <div className={styles.tour_information_item}>
                  <span>
                    Không gian: {spaceItem ? spaceItem.name : "Không tìm thấy"}
                  </span>
                </div>
                <div className={`${styles.tour_information_item} `}>
                  <span className={styles.label_information}>Tên tour : </span>
                  <div className={styles.input_container}>
                    {!isEditing ? (
                      <>
                        <input
                          type="text"
                          id="input"
                          value={masterNameInput}
                          disabled
                        />

                        <RiEdit2Line
                          className={styles.input_edit}
                          onClick={handleEditInput}
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          id="input"
                          ref={inputRef}
                          required
                          defaultValue={masterNameInput}
                        />
                        <FaSave
                          className={styles.input_edit}
                          onClick={() => {
                            const newName = inputRef.current?.value || "";
                            setMasterNameInput(newName);
                            handleRename(newName);
                          }}
                        />
                      </>
                    )}
                    <div className={styles.underline}></div>
                  </div>
                </div>

                <div className={styles.tour_information_item}>
                  <span className={styles.label_information}>
                    Danh sách ảnh: ({panaramaListInTour.length})
                  </span>
                  <div className={styles.list_panorama_container}>
                    {panaramaListInTour.map((item) => (
                      <div key={item.id} className={styles.list_panorama_item}>
                        <img
                          src={
                            imageRef.current[item.url]?.objectUrl || item.url
                          }
                          alt={item.config.name}
                          className={styles.thumbnail_node}
                          onClick={
                            chooseMaster
                              ? () => {
                                  handleSelectMasterNode(item.id);
                                }
                              : undefined
                          }
                        />

                        <span
                          className={styles.delete_panorama_item}
                          onClick={() => {
                            deletePanoramaItem(item.id);
                          }}
                        >
                          <MdClear />
                        </span>
                        {[2, 3].includes(item.config.status) && (
                          <span className={styles.master_panorama_item}>
                            <GiQueenCrown />
                          </span>
                        )}
                      </div>
                    ))}
                    {panaramaListInTour.length < MAX_QUANTITY_PANORAMA && (
                      <div className={styles.list_panorama_item}>
                        <input
                          ref={inputRef}
                          type="file"
                          onChange={handleFileChange}
                          accept={".jpg , .jpeg, .avif, .webp, .png"}
                          style={{ display: "none" }}
                        />
                        {fileStatuses && fileStatuses.status === "uploading" ? (
                          <div className={styles.loaderWrapper}>
                            <div className={styles.loader}></div>
                          </div>
                        ) : (
                          <FaPlus onClick={onChooseFile} />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.tour_information_item}>
                  <span>Chọn ảnh trung tâm</span>
                  <div
                    className={styles.choose_master}
                    onClick={() => {
                      handleChooseMaster();
                    }}
                  >
                    {chooseMaster ? <FaLockOpen /> : <FaLock />}
                  </div>
                </div>
              </div>
              <div className={styles.tour_tracking}>
                <TrackingNode
                  panoramaList={panaramaListInTour}
                  hotspotNavigations={hotspotNavigations}
                  imageRef={imageRef}
                />
              </div>
            </div>

            <span className={styles.zoom_out_minimap} onClick={handleZoomMap}>
              <MdZoomInMap />
            </span>
          </>
        )}
      </div>
    </Html>
  );
};

export default MiniMap;
