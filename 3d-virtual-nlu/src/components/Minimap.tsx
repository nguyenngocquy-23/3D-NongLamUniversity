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
  DEFAULT_ZOOM_ANGLE,
} from "../utils/Constants";
import { useEffect, useState } from "react";

type MiniMapProps = {
  currentPanorama: PanoramaItem;
};
const MiniMap: React.FC<MiniMapProps> = ({ currentPanorama }) => {
  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
  };

  const dispatch = useDispatch();

  const { panoramaList } = useSelector((state: RootState) => state.panoramas);
  const angle = getAngleFromXZ(
    currentPanorama.config.positionX,
    currentPanorama.config.positionZ
  );

  const { startSvg, endSvg } = getArcAnglesThree(
    DEFAULT_ANGLE_THREE,
    DEFAULT_ANGLE_RADAR,
    angle,
    100
  );

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
                  item.id === currentPanorama?.id ? styles.nodeSelected : ""
                }`}
                onClick={() => handleSelectNode(item.id)}
              >
                <img
                  src={item.url}
                  alt={item.config.name}
                  className={styles.thumbnail_node}
                />
              </div>
              {/* <span className={styles.name_node}>{item.config.name}</span> */}
            </div>
          ))}
        </div>
        <div className={styles.minimap_content}>
          <img src="/khoa.jpg" alt="panorama" className={styles.master_node} />
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
                fill="rgba(255,255,255,0.6)"
              />
            </svg>
          </div>
        </div>
      </div>
    </Html>
  );
};

export default MiniMap;
