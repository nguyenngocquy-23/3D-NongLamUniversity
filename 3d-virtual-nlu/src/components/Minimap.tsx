import { Html } from "@react-three/drei";
import styles from "../styles/minimap.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import { PanoramaItem, selectPanorama } from "../redux/slices/PanoramaSlice";
import { RiEdit2Line } from "react-icons/ri";
import { MdZoomOutMap } from "react-icons/md";
import { getAngleFromXZ, getArcAnglesThree } from "../utils/MathUtils";
import {
  DEFAULT_ANGLE_RADAR,
  DEFAULT_ANGLE_THREE,
  RADIUS_MINIMAP_TOUR,
  RADIUS_SPHERE,
} from "../utils/Constants";
import { GiQueenCrown } from "react-icons/gi";
import { HotspotNavigation } from "../redux/slices/HotspotSlice";
import { TiTick } from "react-icons/ti";

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
  const masterPanorama = panoramaList.find((h) => h.config.status === 2);
  /**
   * Là danh sách các hostpot navigation từ Master Node.
   * - Đã có targetNodeId!
   */
  const hotspotFromMaster = hotspotNavigations.filter(
    (hotspot) =>
      hotspot.targetNodeId &&
      hotspot.targetNodeId.trim() !== "" &&
      hotspot.nodeId === masterPanorama?.id
  );

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
    return hotspotNavigations.filter(
      (h) =>
        h.targetNodeId &&
        h.targetNodeId.trim() !== "" &&
        (h.nodeId === nodeId || h.targetNodeId === nodeId)
    );
  };

  const checkFullhotspotNavigation = (nodeId: string, nodeStatus: number) => {
    const limit = 2 * limitNavigation(nodeStatus === 2);
    return hotspotNavigationFromNode(nodeId).length === limit;
  };

  return (
    <Html
      transform={false}
      occlude={false}
      fullscreen
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        className={styles.minimap_container}
        style={{
          pointerEvents: "auto",
        }}
      >
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
                {checkFullhotspotNavigation(item.id, item.config.status) && (
                  <div className={styles.node_success}>
                    <TiTick className={styles.node_tick} />
                  </div>
                )}

                {item.config.status === 2 && (
                  <div className={styles.master_node_icon_container}>
                    <GiQueenCrown className={styles.master_node_icon} />
                  </div>
                )}

                <span className={styles.node_name}>{item.config.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.minimap_content}>
          <img
            src={masterPanorama?.url}
            alt="panorama_master"
            className={styles.master_node}
          />
          {hotspotFromMaster.map((item) => {
            const { x, y } = scalePosition(item.positionX, item.positionZ);
            return (
              <img
                key={item.id}
                src={panoramaTargetUrl(item.targetNodeId)}
                alt="node"
                className={styles.slave_node}
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
    </Html>
  );
};

export default MiniMap;
