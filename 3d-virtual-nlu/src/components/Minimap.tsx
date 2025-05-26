import { Html } from "@react-three/drei";
import styles from "../styles/minimap.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import { PanoramaItem, selectPanorama } from "../redux/slices/PanoramaSlice";
import { RiEdit2Line } from "react-icons/ri";
import { MdZoomOutMap } from "react-icons/md";
import { getAngleFromXZ, getArcAnglesThree } from "../utils/MathUtils";
import { DEFAULT_ANGLE_RADAR, DEFAULT_ANGLE_THREE } from "../utils/Constants";
import { GiQueenCrown } from "react-icons/gi";
import { HotspotNavigation } from "../redux/slices/HotspotSlice";

type MiniMapProps = {
  currentPanorama: PanoramaItem;
  angleCurrent: number;
};
const MiniMap: React.FC<MiniMapProps> = ({ currentPanorama, angleCurrent }) => {
  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
  };

  const dispatch = useDispatch();

  const { panoramaList } = useSelector((state: RootState) => state.panoramas);
  const hotspotNavigations = useSelector((state: RootState) =>
    state.hotspots.hotspotList.filter(
      (hotspot): hotspot is HotspotNavigation => hotspot.type === 1
    )
  );
  /**
   * Lấy ra danh sách các hotspot đã có chủ.
   */
  const nodeInMaps = hotspotNavigations.filter(
    (hotspot) => hotspot.targetNodeId && hotspot.targetNodeId.trim() !== ""
  );

  const masterPanorama = panoramaList.find((h) => h.config.status === 2);

  const { startSvg, endSvg } = getArcAnglesThree(
    DEFAULT_ANGLE_THREE,
    DEFAULT_ANGLE_RADAR,
    angleCurrent,
    100
  );

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
    return panoramaTarget?.url;
  };

  const scalePosition = (x: number, z: number, originR = 100, targetR = 48) => {
    const scale = targetR / originR;
    return {
      x: 50 + x * scale, // dịch về tâm minimap (50, 50)
      y: 50 + z * scale,
    };
  };
  return (
    <Html transform={false} occlude={false} className={styles.html_inner}>
      <div className={styles.minimap_container}>
        <div className={styles.minimap_header}>
          <MdZoomOutMap />
          <RiEdit2Line />
          {panoramaList.map((item) => (
            <div key={item.id} className={styles.node}>
              <div
                className={` ${styles.node_view}  ${
                  item.id === currentPanorama?.id ? styles.node_selected : ""
                }`}
                onClick={() => handleSelectNode(item.id)}
              >
                <img
                  src={item.url}
                  alt={item.config.name}
                  className={styles.thumbnail_node}
                />
                {item.config.status === 2 && (
                  <div className={styles.master_node_icon_container}>
                    <GiQueenCrown className={styles.master_node_icon} />
                  </div>
                )}
              </div>
              {/* <span className={styles.name_node}>{item.config.name}</span> */}
            </div>
          ))}
        </div>
        <div className={styles.minimap_content}>
          <img
            src={masterPanorama?.url}
            alt="panorama_master"
            className={styles.master_node}
          />
          {nodeInMaps.map((item) => {
            const { x, y } = scalePosition(item.positionX, item.positionZ);
            return (
              <img
                key={item.id}
                src={panoramaTargetUrl(item.targetNodeId)}
                alt="node"
                className={styles.slave_node}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  objectFit: "cover",
                  clipPath: "50% at center",
                  width: "30px",
                  height: "30px",
                }}
              />
            );
          })}

          <div className={styles.rotation_node}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {" "}
              <path
                d={generateArcPath(50, 50, 48, startSvg, endSvg)}
                fill="rgba(255, 255, 255, 0.23)"
              />
            </svg>
          </div>
        </div>
      </div>
    </Html>
  );
};

export default MiniMap;
