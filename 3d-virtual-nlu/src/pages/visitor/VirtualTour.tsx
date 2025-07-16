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
import { AnimatePresence, motion } from "framer-motion";
import {
  buildImageUrlWithQuality,
  ImageQuality,
} from "../../utils/getCloudinaryURL.ts";
import { vectorComponents } from "three/webgpu";
import {
  FaAngleLeft,
  FaCompass,
  FaMap,
  FaPause,
  FaPlay,
  FaScreenpal,
  FaX,
} from "react-icons/fa6";
import { MdOpenInFull } from "react-icons/md";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper.ts";
import { addPanoramasFromResponse } from "../../redux/slices/PanoramaSlice.ts";
import Swal from "sweetalert2";
import useTrackTourView from "../../hooks/useTrackTourView.ts";
import {
  useImageCache,
  useModelCache,
} from "../../contexts/ImageCacheContext.tsx";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { useGLTF } from "@react-three/drei";

/*
 * Nhằm mục đích tái sử dụng Virtual Tour.
 * => Nhận vào 1 texture url (Test)
 * Chúng ta sẽ cần nhận vào 1 danh sách thông tin url để hiển thị
 * Virtual Tour sẽ nằm ở 2 dạng chính:
 * 1. Hiển thị khi thêm tour mới.
 * 2. Hiển thị màn hình cho phép người dùng di chuyển tại giao diện.
 */
const VirtualTour = () => {
  const imageRef = useImageCache(); //Sử dụng trong context phục vụ cho việc cache lần đầu.
  const modelRef = useModelCache();

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

  useTrackTourView(nodeToRender.id);

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

  const [isRotation, setIsRotation] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isMenuPin, setIsMenuPin] = useState(false);

  const [cursor, setCursor] = useState("grab");

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
    const divInfo = document.querySelector<HTMLElement>(`.${styles.info_box}`);
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
    const textInfo = document.querySelector(`.${styles.info_box}`)?.textContent;

    if (!textInfo) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    const speak = (voiceList: any) => {
      const newUtterance = new SpeechSynthesisUtterance(textInfo);
      newUtterance.pitch = 1;
      newUtterance.rate = 1;
      newUtterance.lang = "vi-VN";

      const vietnameseVoice =
        voiceList.find(
          (v: any) =>
            v.lang === "vi-VN" && v.name.toLowerCase().includes("google")
        ) || voiceList.find((v: any) => v.lang === "vi-VN");

      if (vietnameseVoice) {
        newUtterance.voice = vietnameseVoice;
      } else {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Không tìm thấy giọng tiếng Việt",
          text: "Vui lòng cài đặt giọng tiếng Việt cho trình duyệt.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }

      newUtterance.volume = isMuted ? 0 : 1;

      setUtterance(newUtterance);
      speechSynthesis.speak(newUtterance);
    };

    const waitForVoices = (
      callback: (voices: SpeechSynthesisVoice[]) => void
    ) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        callback(voices);
      } else {
        const interval = setInterval(() => {
          const voicesNow = speechSynthesis.getVoices();
          if (voicesNow.length > 0) {
            clearInterval(interval);
            callback(voicesNow);
          }
        }, 100);
      }
    };

    waitForVoices((voices) => {
      speak(voices);
    });
  };

  //Xử lý hiển thị Menu bên trái.
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
    if (isMenuPin) return;
    const mouse = event.clientX;

    const threshold = 200;

    if (mouse > threshold) {
      setIsMenuVisible(false);
    }
  };

  // Gọi hàm để đọc văn bản khi thay đổi trạng thái âm thanh
  const hasMounted = useRef(false);

  useEffect(() => {
    if (utterance) {
      speechSynthesis.cancel(); // Dừng tất cả
      const newUtterance = new SpeechSynthesisUtterance(utterance.text);
      newUtterance.voice = utterance.voice;
      newUtterance.lang = utterance.lang;
      newUtterance.pitch = utterance.pitch;
      newUtterance.rate = utterance.rate;
      newUtterance.volume = isMuted ? 0 : 1;

      setUtterance(newUtterance);
      speechSynthesis.speak(newUtterance);
    }
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
   *
   *
   *  CACHE ẢNH PHÍA CLIENT
   *
   */

  useEffect(() => {
    if (!nodeToRender) return;

    //Sử dụng cho hàm read text.
    if (!hasMounted.current) {
      hasMounted.current = true;
      return; // bỏ qua lần mount đầu tiên (Strict Mode sẽ gọi 2 lần)
    }
    readText();

    //Nạp ảnh vào RAM.

    const { id, url, navHotspots, infoHotspots, modelHotspots } = nodeToRender;

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
            setTimeout(() => {
              setImageVersion((v) => v + 1);
              console.log("Giá trị imageVersion: VirtualTour", imageVersion);
            }, 3000); // Delay 100ms
          }
        };
      } catch (err) {
        console.warn("Không load được ảnh 360 cho nodeToRender", id, err);
      }
    };
    loadHighRes();

    //Nạp mô hình glb vào RAM.
    const gltfLoader = new GLTFLoader();
    const glbURLset = new Set<string>();

    [
      ...(navHotspots ?? []),
      ...(infoHotspots ?? []),
      ...(modelHotspots ?? []),
    ].forEach((h) => {
      if (h?.url?.endsWith(".glb")) {
        glbURLset.add(h.url);
      }
    });

    glbURLset.forEach((modelUrl) => {
      if (modelRef.current[modelUrl]) return;
      const loadModel = async () => {
        try {
          const response = await fetch(modelUrl);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);

          gltfLoader.load(objectUrl, (gltf) => {
            modelRef.current[modelUrl] = {
              glbScene: gltf.scene,
              objectUrl,
              quality: "high",
              lastUsed: Date.now(),
            };
            console.log("✅ Cached mô hình GLB:", modelUrl);
          });
        } catch (err) {
          console.warn("⚠️ Không preload được mô hình GLB:", modelUrl, err);
        }
      };

      loadModel();
    });
  }, [nodeToRender]);

  const getUrlGLB = (iconId: number): string | null => {
    //Icon phải là icon 3D
    const iconObj = icons.find((i) => i.id === iconId && i.type === 2);
    if (iconObj) return iconObj.url;
    return null;
  };

  useEffect(() => {
    if (!preloadNodes || preloadNodes.length === 0) return;

    let loaded = 0;
    const total = preloadNodes.length;

    const gltfLoader = new GLTFLoader();
    const glbURLSet = new Set<string>();

    preloadNodes.forEach(async (node) => {
      const existing = imageRef.current[node.id];
      if (!existing) {
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
              setIsWaiting(false);
            }
          };
        } catch (err) {
          console.warn("Lỗi không thể tải reload:", node.url, err);
        }

        const { navHotspots, infoHotspots, modelHotspots } = node;

        [
          ...(navHotspots ?? []),
          ...(infoHotspots ?? []),
          ...(modelHotspots ?? []),
        ].forEach((h) => {
          //glbUrl sẽ có giá trị nếu nó là icon.
          const glbUrl = getUrlGLB(h.iconId);
          if (glbUrl?.endsWith(".glb")) {
            glbURLSet.add(glbUrl);
            console.log("Giá trị URL cần cache", glbUrl);
            console.log("URL", glbURLSet.size);
          }
        });

        glbURLSet.forEach((modelUrl) => {
          if (modelRef.current[modelUrl]) return;

          const loadModel = async () => {
            try {
              const response = await fetch(modelUrl);
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);

              gltfLoader.load(objectUrl, (gltf) => {
                modelRef.current[modelUrl] = {
                  glbScene: gltf.scene,
                  objectUrl,
                  quality: "high",
                  lastUsed: Date.now(),
                };
                console.log("✅ Preloaded GLB (preloadNodes):", modelUrl);
              });
            } catch (err) {
              console.warn(
                "⚠️ Không preload được GLB từ preloadNodes:",
                modelUrl,
                err
              );
            }
          };

          loadModel();
        });
      }
    });
  }, [preloadNodes]);

  if (!icons || icons.length === 0) {
    return (
      <>
        <div className={styles.info_box} style={{ display: "none" }}>
          {nodeToRender.description ??
            "Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông Lâm Thành phố Hồ Chí Minh"}
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
      {isWaiting ? <Waiting percent={percent} /> : ""}
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

      <div className={styles.header_tour}>
        <h2>NLU360</h2>
        <IoIosCloseCircle className={styles.close_btn} onClick={handleClose} />
      </div>

      {fullMap || hoverMap || !isMenuVisible ? (
        ""
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.left_tour}
          >
            <LeftMenuTour
              isMenuPin={isMenuPin}
              setIsMenuPin={setIsMenuPin}
              isMenuVisible={isMenuVisible}
              setIsMenuVisible={setIsMenuVisible}
              imageRef={imageRef}
            />
          </motion.div>
        </AnimatePresence>
      )}

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
        <>
          <button
            className={styles.pause_button}
            style={{ display: isRotation ? "block" : "none" }}
            onClick={() => {
              setIsRotation(false);
            }}
          >
            <FaPause />
          </button>
          <button
            className={styles.play_button}
            style={{ display: isRotation ? "none" : "block" }}
            onClick={() => {
              setIsRotation(true);
            }}
          >
            <FaPlay />
          </button>
        </>
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
      {/* Hộp thông tin */}
      <div className={styles.info_box} onClick={toggleInformation}>
        {nodeToRender.description ??
          "Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông Lâm Thành phố Hồ Chí Minh"}
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
