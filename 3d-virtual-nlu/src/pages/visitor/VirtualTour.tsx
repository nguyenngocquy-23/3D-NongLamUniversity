import styles from "../../styles/virtualTour.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Chat from "../../features/Chat.tsx";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircle, IoIosCompass } from "react-icons/io";
import FooterTour from "../../components/visitor/FooterTour.tsx";
import LeftMenuTour from "../../components/visitor/LeftMenuTour.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store.ts";
import {
  fetchDefaultNodes,
  fetchIcons,
  fetchPreloadNodes,
} from "../../redux/slices/DataSlice.ts";
import Waiting from "../../components/Waiting.tsx";
import {
  addHotspotsFromResponse,
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice.ts";
import TourCanvas from "../../components/visitor/TourCanvas.tsx";
import { RADIUS_SPHERE } from "../../utils/Constants.ts";
import CommentBox from "../../components/visitor/CommentBox.tsx";
import MapLeaflet from "../../components/visitor/MapLeaflet.tsx";
import { FaAngleLeft, FaMap, FaX } from "react-icons/fa6";
import { MdOpenInFull } from "react-icons/md";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper.ts";
import { addPanoramasFromResponse } from "../../redux/slices/PanoramaSlice.ts";
import axios from "axios";
import { API_URLS } from "../../env.ts";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildImageUrlWithQuality,
  ImageQuality,
} from "../../utils/getCloudinaryURL.ts";
import { vectorComponents } from "three/webgpu";

export type ImageCacheEntry = {
  img: HTMLImageElement;
  objectUrl: string;
  quality: ImageQuality;
  lastUsed: number; //time to live
};

/**
 * string: id của node hiện tại
 */
export type ImageCacheMap = Record<string, ImageCacheEntry>;
/**
 * Nhằm mục đích tái sử dụng Virtual Tour.
 * => Nhận vào 1 texture url (Test)
 * Chúng ta sẽ cần nhận vào 1 danh sách thông tin url để hiển thị
 * Virtual Tour sẽ nằm ở 2 dạng chính:
 * 1. Hiển thị khi thêm tour mới.
 * 2. Hiển thị màn hình cho phép người dùng di chuyển tại giao diện.
 */
const VirtualTour = () => {
  const imageRef = useRef<ImageCacheMap>({});

  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((state: RootState) => state.data.status);
  const user = useSelector((state: RootState) => state.auth.user);
  const reduxDefaultNode = useSelector(
    (state: RootState) => state.data.defaultNode
  );

  const icons = useSelector((state: RootState) => state.data.icons);

  // Fallback: lấy từ localStorage nếu Redux chưa có dữ liệu
  const nodeToRender = useMemo(() => {
    if (reduxDefaultNode) return reduxDefaultNode;
    const stored = localStorage.getItem("defaultNode");
    return stored ? JSON.parse(stored) : null;
  }, [reduxDefaultNode]);

  const [isMobile, setIsMobile] = useState(false);
  const [imageVersion, setImageVersion] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchIcons());
    dispatch(fetchDefaultNodes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPreloadNodes(nodeToRender.id));
  }, [nodeToRender]);

  const hotspotModels = useMemo(() => {
    return (nodeToRender?.modelHotspots as HotspotModel[]) || [];
  }, [nodeToRender]);

  const hotspotMedias = useMemo(() => {
    return (nodeToRender?.mediaHotspots as HotspotMedia[]) || [];
  }, [nodeToRender]);

  const hotspotNavigations = useMemo(() => {
    return (nodeToRender?.navHotspots as HotspotNavigation[]) || [];
  }, [nodeToRender]);

  const hotspotInformations = useMemo(() => {
    return (nodeToRender?.infoHotspots as HotspotInformation[]) || [];
  }, [nodeToRender]);

  const [isRotation, setIsRotation] = useState(
    nodeToRender.autoRotate || false
  );

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh

  const [isComment, setIsComment] = useState(false); // Trạng thái âm thanh

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  );

  const [accessing, setAccessing] = useState(0);

  /**
   * Lớp chờ để ẩn các tiến trình render
   * Tạo cảm giác loading cho người dùng
   */
  const [isWaiting, setIsWaiting] = useState(true);

  /**
   * State lưu trạng thái đóng mở hộp radar
   * Radar sẽ hiển thị các điểm tham quan
   */
  const [isOpenRadar, setIsOpenRadar] = useState(false);

  /**
   * State để mở hộp thông tin
   */
  const [isOpenInfo, setIsOpenInfo] = useState(true);

  const [hideMap, setHideMap] = useState(false);
  const [fullMap, setFullMap] = useState(false);
  const [hoverMap, setHoverMap] = useState(false);
  /**
   * Ref để cập nhật giá trị kích thước của map
   */
  const mapRef = useRef<L.Map | null>(null);

  const navigate = useNavigate();
  const sphereRef = useRef<THREE.Mesh | null>(null);

  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null); //test

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    let resizeTimer: number;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClose = () => {
    navigate("/");
  };

  const requestFullscreen = (element: any) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      // Chrome, Safari và Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    // const canvas = canvasRef.current;
    // if(!canvas) return;
    const containerCanvas = document.querySelector(`.${styles.tourContainer}`);
    console.log(containerCanvas);
    if (!containerCanvas) return;
    if (!isFullscreen) {
      requestFullscreen(containerCanvas); // Chuyển canvas sang fullscreen
      setIsFullscreen(true);
    } else {
      exitFullscreen(); // Thoát fullscreen
      setIsFullscreen(false);
    }
  };

  const toggleInformation = () => {
    const divInfo = document.querySelector<HTMLElement>(`.${styles.infoBox}`);
    if (!divInfo) return;

    if (isOpenInfo) {
      divInfo.style.display = "none";
      divInfo.style.bottom = "-100px";
    } else {
      divInfo.style.display = "block";
      divInfo.style.bottom = "50px";
    }
    setIsOpenInfo(!isOpenInfo);
  };
  // Hàm bật/tắt âm thanh
  const toggleMute = () => {
    setIsMuted((preState) => !preState);
  };

  // Hàm để đọc văn bản
  const readText = () => {
    const textInfo = document.querySelector(`.${styles.infoBox}`)?.textContent;
    console.log(textInfo);

    // Kiểm tra xem API SpeechSynthesis có sẵn không
    if ("speechSynthesis" in window) {
      // Kiểm tra nếu textInfo có giá trị trước khi đọc
      if (textInfo) {
        // Nếu không có utterance hiện tại, tạo một đối tượng mới
        if (!utterance) {
          const newUtterance = new SpeechSynthesisUtterance(textInfo);
          // Bạn có thể tùy chỉnh các thuộc tính của lời nói
          newUtterance.lang = "vi-VN"; // Chọn ngôn ngữ (ở đây là tiếng Việt)
          newUtterance.pitch = 1; // Điều chỉnh độ cao của giọng nói
          newUtterance.rate = 1; // Điều chỉnh tốc độ đọc

          // Kiểm tra trạng thái âm thanh
          if (isMuted) {
            newUtterance.volume = 0; // Tắt âm thanh
          } else {
            newUtterance.volume = 1; // Bật âm thanh
          }

          // Lưu đối tượng utterance vào state
          setUtterance(newUtterance);

          // Khởi tạo việc đọc văn bản
          speechSynthesis.speak(newUtterance);
        } else {
          // Nếu âm thanh bị tắt, tạm dừng việc phát âm thanh
          if (isMuted) {
            speechSynthesis.pause();
          } else {
            // Nếu âm thanh bật, tiếp tục phát âm thanh từ điểm dừng
            speechSynthesis.resume();
          }
        }
      } else {
        console.error("Không tìm thấy văn bản để đọc.");
      }
    } else {
      console.error("Speech synthesis API is not supported in this browser.");
    }
  };

  const handleMouseEnterMenu = (event: any) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const thresholdX = window.innerWidth * 0.05;
    const thresholdY = window.innerHeight * 0.5;
    if (mouseX < thresholdX && mouseY < thresholdY && !hoverMap) {
      setIsMenuVisible(true);
    }
  };

  const handleCloseMenu = (event: any) => {
    const mouse = event.clientX;

    const threshold = 200;
    if (mouse > threshold) {
      setIsMenuVisible(false);
    }
  };

  // Gọi hàm để đọc văn bản khi thay đổi trạng thái âm thanh
  useEffect(() => {
    readText();
  }, [isMuted]);

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current!.invalidateSize();
      }, 300); // chờ animation transition xong
    }
  }, [fullMap, hoverMap]);

  // const defaultNode = sessionStorage.getItem("defaultNode");
  // let defaultNode = null;
  // if (defaultNodeJson) defaultNode = JSON.parse(defaultNodeJson);

  const [percent, setPercent] = useState(0);

  // useEffect(() => {
  //   let progress = 0;
  //   const interval = setInterval(() => {
  //     progress += Math.random() * 10;
  //     if (progress >= 100) {
  //       progress = 100;
  //       clearInterval(interval);
  //       // Đợi render xong mới tắt loading
  //       requestAnimationFrame(() => {
  //         setTimeout(() => setIsWaiting(false), 500);
  //       });
  //     }
  //     setPercent(Math.floor(progress));
  //   }, 200);

  //   return () => clearInterval(interval);
  // }, []);

  const preloadNodes = useSelector(
    (state: RootState) => state.data.preloadNodes
  );

  useEffect(() => {
    if (preloadNodes) {
      const nodes = [nodeToRender, ...preloadNodes];
      const { panoramaList, hotspotList } =
        TourNodeRequestMapper.mapToPanoramaAndHotspots(nodes);

      dispatch(addPanoramasFromResponse(panoramaList));
      dispatch(addHotspotsFromResponse(hotspotList));
    }
  }, [preloadNodes, nodeToRender, dispatch]);

  /**
   *  CACHE ẢNH PHÍA CLIENT
   *
   */

  useEffect(() => {
    if (!nodeToRender) return;
    const { id, url } = nodeToRender;

    const existing = imageRef.current[id];
    if (existing && existing.quality === "8K") return; //Nếu tồn tại rồi & 8K => Tức là đã từng hiển thị thì không tải nữa.

    const loadHighRes = async () => {
      try {
        const highResURL = buildImageUrlWithQuality(url, "8K");
        const response = await fetch(highResURL, { mode: "cors" });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = objectUrl;

        img.onload = () => {
          imageRef.current[id] = {
            img,
            objectUrl,
            quality: "8K",
            lastUsed: Date.now(),
          };

          if (nodeToRender.id === id) {
            setImageVersion((v) => v + 1);
          }
        };
      } catch (err) {
        console.warn("Không load được ảnh 360 cho nodeToRender", id, err);
      }
    };

    loadHighRes();
  }, [nodeToRender]);

  useEffect(() => {
    if (!preloadNodes || preloadNodes.length === 0) return;

    let loaded = 0;
    const total = preloadNodes.length;

    preloadNodes.forEach(async (node) => {
      const existing = imageRef.current[node.id];

      if (existing) return; //Có rồi thì không tải nữa.

      try {
        const lowResURL = buildImageUrlWithQuality(node.url, "2K");

        const response = await fetch(lowResURL, { mode: "cors" });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = objectUrl;

        img.onload = () => {
          loaded++;
          imageRef.current[node.id] = {
            img,
            objectUrl,
            quality: "2K",
            lastUsed: Date.now(),
          };

          setPercent(Math.floor((loaded / total) * 100));
          if (loaded === total) {
            // imageRef.current = imgCache;
            setIsWaiting(false);
          }
        };
      } catch (err) {
        console.warn("Lỗi không thể tải reload:", node.url, err);
      }
    });
  }, [preloadNodes]);

  if (!icons || icons.length === 0) {
    return (
      <>
        <div className={styles.infoBox} style={{ display: "none" }}>
          Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông
          Lâm Thành phố Hồ Chí Minh
        </div>
      </>
    );
  }

  if (
    !hotspotModels ||
    !hotspotMedias ||
    !hotspotNavigations ||
    !hotspotInformations
  ) {
    return null;
  }

  if (!nodeToRender) {
    return null;
  }

  return (
    <div
      className={styles.tourContainer}
      onPointerMove={handleMouseEnterMenu}
      onPointerDown={handleCloseMenu}
    >
      {isWaiting ? (
        <Waiting percent={percent} />
      ) : (
        <TourCanvas
          windowSize={windowSize}
          cursor={cursor}
          sphereRef={sphereRef}
          radius={RADIUS_SPHERE}
          defaultNode={nodeToRender}
          targetPosition={targetPosition ?? null}
          hotspotNavigations={hotspotNavigations}
          hotspotInformations={hotspotInformations}
          hotspotModels={hotspotModels}
          hotspotMedias={hotspotMedias}
          isRotation={isRotation}
          setTargetPosition={setTargetPosition}
          isOpenRadar={isOpenRadar}
          setIsOpenRadar={setIsOpenRadar}
          imageRef={imageRef}
          imageVersion={imageVersion}
        />
      )}

      <div className={styles.headerTour}>
        <h2>NLU360</h2>
        <IoIosCloseCircle className={styles.close_btn} onClick={handleClose} />
      </div>

      {/* {fullMap || hoverMap ? (
        ""
      ) : (
        <LeftMenuTour isMenuVisible={isMenuVisible} imageRef={imageRef} />
      )} */}

      <AnimatePresence>
        <motion.div
          initial={{ y: 800, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 800, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`${styles.update_hotspot_container} `}
        ></motion.div>
      </AnimatePresence>
      {isMenuVisible && <LeftMenuTour imageRef={imageRef} />}

      {!isOpenRadar && (
        <button
          className={styles.open_radar_button}
          title="Mở la bàn"
          onClick={() => setIsOpenRadar(true)}
        >
          <IoIosCompass />
        </button>
      )}

      {/* Hộp chat sửa wss */}
      <Chat nodeId={nodeToRender.id} setAccessing={setAccessing} />
      {/* Footer chứa các tính năng */}
      {isMobile ? (
        ""
      ) : (
        <FooterTour
          isRotation={isRotation}
          setIsRotation={setIsRotation}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          toggleInformation={toggleInformation}
          toggleFullscreen={toggleFullscreen}
          toggleMute={toggleMute}
          setIsComment={setIsComment}
          accessing={accessing}
        />
      )}
      <div className={styles.infoBox} onClick={toggleInformation}>
        Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông
        Lâm Thành phố Hồ Chí Minh
      </div>
      {isComment && user ? (
        <CommentBox
          userId={user.id}
          nodeId={nodeToRender.id}
          setIsComment={setIsComment}
        />
      ) : (
        ""
      )}
      {/* Bản đồ */}
      {isMobile ? (
        ""
      ) : (
        <div
          className={`${fullMap ? styles.full_map : styles.map_box}`}
          onMouseEnter={() => setHoverMap(true)}
          onMouseLeave={() => {
            setTimeout(() => {
              setHoverMap(false);
            }, 2000);
          }}
          style={{ width: hideMap ? "10px" : "" }}
        >
          {hideMap ? (
            <button
              className={styles.show_map_button}
              onClick={() => setHideMap(false)}
              title={"Mở bản đồ"}
            >
              <FaMap />
            </button>
          ) : (
            <>
              <MapLeaflet spaceId={nodeToRender.spaceId} mapRef={mapRef} />
              {fullMap ? (
                <button
                  className={styles.full_button}
                  onClick={() => setFullMap(false)}
                  title={"Thu nhỏ"}
                >
                  <FaX />
                </button>
              ) : (
                <>
                  <button
                    className={styles.hide_button}
                    onClick={() => {
                      setHideMap(true);
                    }}
                    title={"Ẩn bản đồ"}
                  >
                    <FaAngleLeft />
                  </button>
                  {hoverMap ? (
                    <button
                      className={styles.full_button}
                      onClick={() => setFullMap(true)}
                      title={"Mở rộng"}
                    >
                      <MdOpenInFull />
                    </button>
                  ) : (
                    ""
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VirtualTour;
