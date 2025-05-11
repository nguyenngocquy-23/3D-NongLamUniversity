import TourScene from "../../components/visitor/TourScene";
import { Canvas, useThree } from "@react-three/fiber";
import styles from "../../styles/virtualTour.module.css";
import CamControls from "../../components/visitor/CamControls";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import Chat from "../../features/Chat.tsx";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";
import FooterTour from "../../components/visitor/FooterTour.tsx";
import LeftMenuTour from "../../components/visitor/LeftMenuTour.tsx";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize.tsx";
import {
  CornerPoint,
  HotspotMediaCreateRequest,
  HotspotModelCreateRequest,
} from "../../components/admin/taskCreateTourList/Task3AddHotspot.tsx";
import axios from "axios";
import GroundHotspotModel from "../../components/visitor/GroundHotspotModel.tsx";
import { VideoMeshProps } from "../admin/CreateTourStep2.tsx";

/**
 * Nhằm mục đích tái sử dụng Virtual Tour.
 * => Nhận vào 1 texture url (Test)
 * Chúng ta sẽ cần nhận vào 1 danh sách thông tin url để hiển thị
 * Virtual Tour sẽ nằm ở 2 dạng chính:
 * 1. Hiển thị khi thêm tour mới.
 * 2. Hiển thị màn hình cho phép người dùng di chuyển tại giao diện.
 */
type VirtualTourProps = {
  textureUrl: string;
};

const VirtualTour = ({ textureUrl }: VirtualTourProps) => {
  const [isAnimation, setIsAnimation] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false); // Trạng thái fullscreen

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [cursor, setCursor] = useState("grab"); // State để điều khiển cursor

  const [isMuted, setIsMuted] = useState(false); // Trạng thái âm thanh

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  ); // Giữ lại đối tượng utterance

  const navigate = useNavigate();
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [sphereCenter, setSphereCenter] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const [hotspotModels, setHotspotModels] = useState<
    HotspotModelCreateRequest[]
  >([]);

  const [hotspotMedias, setHotspotMedias] = useState<
    HotspotMediaCreateRequest[]
  >([]);

  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null); //test

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    console.log("sphereRef.current trong VirtualTour:", sphereRef.current);
  }, [sphereRef.current]);

  const [hoveredHotspot, setHoveredHotspot] = useState<THREE.Mesh | null>(null); //test

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

  // Hàm gọi API
  const fetchHotspotModels = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/admin/hotspot/getHotspotModel",
        {
          nodeId: 1, // Thay bằng nodeId bạn cần
        }
      );
      setHotspotModels(response.data.data); // Giả sử API trả về { data: [...] }
    } catch (error) {
      console.error("Lỗi khi lấy hotspot:", error);
    }
  };

  const fetchHotspotMedias = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/admin/hotspot/getHotspotMedia",
        {
          nodeId: 1, // Thay bằng nodeId bạn cần
        }
      );
      console.log("response media::", response.data.data);
      setHotspotMedias(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy hotspot:", error);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchHotspotModels();
    fetchHotspotMedias();
  }, []);

  const radius = 100;

  const [hotspots, setHotspots] = useState<
    { id: number; position: [number, number, number]; type: "floor" | "info" }[]
  >([]);

  const handleAddHotspot = (
    position: [number, number, number],
    type: "floor" | "info"
  ) => {
    setHotspots((prev) => [...prev, { id: prev.length + 1, position, type }]);
  };

  const handledSwitchTexture = (newPosition: [number, number, number]) => {
    if (sphereRef.current) {
      const material = sphereRef.current.material as THREE.MeshBasicMaterial;
      const newTexture = material.map?.image.src.includes("khoa.jpg")
        ? new THREE.TextureLoader().load("thuvien.jpg")
        : new THREE.TextureLoader().load("khoa.jpg");
      newTexture.wrapS = THREE.RepeatWrapping;
      newTexture.repeat.x = -1;

      gsap.to(material, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          material.map = newTexture;
          material.needsUpdate = true;
          gsap.to(material, { opacity: 1, duration: 0.5 });
        },
      });
    }
  };

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

  let isOpenInfo = true;
  const toggleInfomation = () => {
    const divInfo = document.querySelector<HTMLElement>(`.${styles.infoBox}`);
    if (!divInfo) {
      return;
    }
    if (isOpenInfo) {
      divInfo.style.display = "block";
      divInfo.style.bottom = "50px";
      isOpenInfo = false;
    } else {
      divInfo.style.display = "none";
      divInfo.style.bottom = "-100px";
      isOpenInfo = true;
    }
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
    const mouse = event.clientX;

    const threshold = window.innerWidth * 0.05;
    if (mouse < threshold) {
      setIsMenuVisible(true);
    }
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  // Gọi hàm để đọc văn bản khi thay đổi trạng thái âm thanh
  useEffect(() => {
    readText();
  }, [isAnimation, isMuted]);

  const VideoMeshComponent = ({
    response,
  }: {
    response: HotspotMediaCreateRequest;
  }) => {
    const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

    const createCustomGeometry = (points: [number, number, number][]) => {
      console.log("points...", points);
      const geometry = new THREE.BufferGeometry();
      const center = [
        response.positionX,
        response.positionY,
        response.positionZ,
      ];
      // const center = getCenterOfPoints(points);

      const vertices = new Float32Array([
        points[0][0] - center[0],
        points[0][1] - center[1],
        points[0][2] - center[2],
        points[1][0] - center[0],
        points[1][1] - center[1],
        points[1][2] - center[2],
        points[2][0] - center[0],
        points[2][1] - center[1],
        points[2][2] - center[2],
        points[3][0] - center[0],
        points[3][1] - center[1],
        points[3][2] - center[2],
      ]);

      const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
      const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);

      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));

      // gắn center lại để dùng bên ngoài nếu cần
      geometry.userData.center = center;

      return geometry;
    };
    const textureCreatedRef = useRef(false);

    useEffect(() => {
      const video = document.createElement("video");
      video.src = response.mediaUrl;
      video.crossOrigin = "anonymous";
      video.muted = true; // nên bật muted để autoplay không bị block
      video.playsInline = true;
      video.loop = true;
      video.autoplay = true;
      video.style.display = "none";
      document.body.appendChild(video);

      const handleCanPlay = () => {
        if (textureCreatedRef.current) return;

        const tex = new THREE.VideoTexture(video);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.format = THREE.RGBFormat;
        tex.needsUpdate = true;

        setTexture(tex);
        textureCreatedRef.current = true;
        video.play();
      };

      video.addEventListener("canplaythrough", handleCanPlay);
      video.load();

      return () => {
        video.removeEventListener("canplaythrough", handleCanPlay);
        video.pause();
        video.src = "";
        video.remove();
        texture?.dispose();
        setTexture(null);
        textureCreatedRef.current = false;
      };
    }, []);

    const cornerPoints = JSON.parse(response.cornerPointList) as [
      number,
      number,
      number
    ][];
    const geometry = createCustomGeometry(cornerPoints);
    const center = geometry.userData.center;

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })
    );

    return <primitive object={mesh} position={center} />;
  };

  return (
    <div className={styles.tourContainer}>
      <Canvas
        camera={{
          fov: 75,
          aspect: windowSize.width / windowSize.height,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0.0000001], // Đặt vị trí mặc định của camera
        }}
        className={styles.tourCanvas}
        onMouseMove={handleMouseEnterMenu}
        onMouseDown={handleCloseMenu}
      >
        <UpdateCameraOnResize />
        <TourScene
          radius={radius}
          sphereRef={sphereRef}
          textureCurrent={textureUrl ?? "/khoa.jpg"}
        />
        <CamControls targetPosition={targetPosition} sphereRef={sphereRef} />
        {/* <CamControls targetPosition={targetPosition} sphereRef={sphereRef} /> */}
        {/* <RaycasterHandler
          radius={radius}
          sphereRef={sphereRef}
          onAddHotspot={(position, type) => handleAddHotspot(position, type)}
          hoveredHotspot={hoveredHotspot} //test
          switchTexture={handledSwitchTexture}
        /> */}
        {/* {hotspots.map((hotspot) => (
          <GroundHotspot
            key={hotspot.id}
            position={hotspot.position}
            type={hotspot.type}
            setHoveredHotspot={setHoveredHotspot}
          />
        ))} */}
        {hotspotModels.map((hotspot, index) => (
          <GroundHotspotModel
            key={index}
            position={[hotspot.positionX, hotspot.positionY, hotspot.positionZ]}
            setHoveredHotspot={setHoveredHotspot}
            modelUrl={hotspot.modelUrl}
          />
        ))}
        {hotspotMedias.map((point, index) => (
          <VideoMeshComponent key={index} response={point} />
        ))}
      </Canvas>
      {/* Header chứa logo + close */}
      <div className={styles.headerTour}>
        <h2>NLU360</h2>
        <IoIosCloseCircle className={styles.close_btn} onClick={handleClose} />
      </div>
      {/* Menu bên trái */}
      <LeftMenuTour isMenuVisible={isMenuVisible} />
      {/* Hộp feedback */}
      <Chat />
      {/* Footer chứa các tính năng */}
      <FooterTour
        isAnimation={isAnimation}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        toggleInfomation={toggleInfomation}
        toggleFullscreen={toggleFullscreen}
        toggleMute={toggleMute}
      />
      {/* Hộp thông tin */}
      <div className={styles.infoBox} onClick={toggleInfomation}>
        Chào mừng bạn đến với chuyến tham quan khuôn viên trường Đại học Nông
        Lâm Thành phố Hồ Chí Minh
      </div>{" "}
      {/* <StatsPanel className={styles.statsPanel} /> */}
    </div>
  );
};

export default VirtualTour;

{
  /*       
        <RaycasterHandler
          sphereRef={sphereRef}
          textureCurrent={textureUrl}
        /> */
}
{
  /* <RaycasterHandler
          radius={radius}
          sphereRef={sphereRef}
          onAddHotspot={(position, type) => handleAddHotspot(position, type)}
          hoveredHotspot={hoveredHotspot} //test
          switchTexture={handledSwitchTexture}
        /> */
}
{
  /* {hotspots.map((hotspot) => (
          <GroundHotspot
            key={hotspot.id}
            position={hotspot.position}
            type={hotspot.type}
            setHoveredHotspot={setHoveredHotspot}
            />
          ))} 
        */
}
