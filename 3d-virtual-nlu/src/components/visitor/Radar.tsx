import { Html } from "@react-three/drei";
import styles from "../../styles/minimap.module.css";
import React, { useEffect, useState } from "react";
import {
  DEFAULT_ANGLE_THREE,
  DEFAULT_ANGLE_RADAR,
  RADIUS_SPHERE,
  RADIUS_MINIMAP_TOUR,
} from "../../utils/Constants";
import { getArcAnglesThree } from "../../utils/MathUtils";
import { FaAngleDoubleRight } from "react-icons/fa";

type RadarProps = {
  currentPanorama: any;
  angleCurrent: number;
  panoramaList: any[];
  navigateList: any[];
  setIsOpenRadar: (val: boolean) => void;
};
const Radar: React.FC<RadarProps> = ({
  currentPanorama,
  angleCurrent,
  panoramaList,
  navigateList,
  setIsOpenRadar,
}) => {
  const masterPanorama = panoramaList.find((h) => h.status === 2);

  const { startSvg, endSvg } = getArcAnglesThree(
    DEFAULT_ANGLE_THREE,
    DEFAULT_ANGLE_RADAR,
    angleCurrent,
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

  const panoramaTargetUrl = (id: number) => {
    const panoramaTarget = panoramaList.find((pano) => pano.id === id);
    return panoramaTarget?.url;
  };

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
    if (currentPanorama.status === 2) {
      return { ctx: 50, ctz: 50 };
    }

    const nodeItem = navigateList.find(
      (item) => item.targetNodeId === currentPanorama.id
    );

    if (nodeItem?.positionX != null && nodeItem?.positionZ != null) {
      const { x, y } = scalePosition(nodeItem.positionX, nodeItem.positionZ);
      return { ctx: x, ctz: y };
    }
    return { ctx: 50, ctz: 50 };
  };

  const { ctx, ctz } = getRadarPosition();

  const [masterNameInput, setMasterNameInput] = useState(
    (masterPanorama?.name || "").slice(0, 40)
  );
  useEffect(() => {
    setMasterNameInput(masterPanorama?.name.slice(0, 40) || "");
  }, [masterPanorama]);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 1); // đợi camera/scene ổn
    return () => clearTimeout(timeout);
  }, []);

  return (
    ready && (
      <Html
        fullscreen
        occlude={false}
        transform={false}
        className={styles.minimap_html}
      >
        <div
          className={styles.minimap_container}
          style={{
            pointerEvents: "auto",
          }}
        >
          <div className={styles.minimap_preview_zoom}>
            <div className={styles.minimap_content}>
              <img
                src={masterPanorama?.url}
                alt="panorama_master"
                className={styles.master_node}
              />

              {navigateList.map((item) => {
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
            <button
              className={styles.close_buttom}
              title="Đóng la bàn"
              onClick={() => setIsOpenRadar(false)}
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </Html>
    )
  );
};

export default Radar;
