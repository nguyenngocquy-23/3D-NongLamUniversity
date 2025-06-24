import { useDispatch, useSelector } from "react-redux";
import styles from "../../../styles/tasklistCT/task2.module.css";
import { RootState } from "../../../redux/Store";
import { updatePanoConfig } from "../../../redux/slices/PanoramaSlice";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DEFAULT_ORIGINAL_Z } from "../../../utils/Constants";
import {
  degreeToRadian,
  getAngleFromXZ,
  radianToDegree,
} from "../../../utils/MathUtils";
// Tuỳ chỉnh thông số kỹ thuật.

type Task2Props = {
  cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
  sphereRef?: React.RefObject<THREE.Mesh | null>;
};

const Task2 = ({ cameraRef, sphereRef }: Task2Props) => {
  const dispatch = useDispatch();
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const currentPanorama = panoramaList.find((p) => p.id === currentSelectId);
  if (!currentPanorama) return null;

  const {
    autoRotate = 0,
    speedRotate = 1,
    lightIntensity = 1,
  } = currentPanorama.config ?? {};

  const [angle, setAngle] = useState<number>(0);

  /**
   * Cập nhật angle mỗi khi đổi panorama
   */

  useEffect(() => {
    if (currentPanorama?.config) {
      const newAngle = radianToDegree(currentPanorama.config.yawOffset);
      setAngle(newAngle);
    }
  }, [currentSelectId]);

  const handleChangeNumber = (
    field: "autoRotate" | "speedRotate" | "lightIntensity",
    value: number
  ) => {
    dispatch(
      updatePanoConfig({
        id: currentPanorama.id,
        config: { [field]: value },
      })
    );
  };

  // ✅ UI thay đổi góc nhìn
  const handleAngleChange = (value: number) => {
    setAngle(value);
  };

  useEffect(() => {
    const newYawOffset = degreeToRadian(angle);

    if (cameraRef?.current) {
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }

    dispatch(
      updatePanoConfig({
        id: currentPanorama.id,
        config: {
          yawOffset: newYawOffset,
        },
      })
    );
  }, [angle]);

  return (
    <div className={styles.task2}>
      <div className={styles.contain_input}>
        <label className={styles.label}>Hướng nhìn mặc định:</label>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={angle}
          className={styles.name_input}
          placeholder="Hướng nhìn"
          onChange={(e) => handleAngleChange(Number(e.target.value))}
        />
      </div>
      <div className={styles.contain_input}>
        <label className={styles.label}>Ánh sáng:</label>
        <input
          type="range"
          min="0"
          max="7"
          step="0.1"
          value={lightIntensity}
          onChange={(e) =>
            handleChangeNumber("lightIntensity", parseFloat(e.target.value))
          }
        />
      </div>
      <div className={styles.contain_input}>
        <label className={styles.label}>Tự động xoay:</label>
        <input
          type="checkbox"
          checked={autoRotate === 1} // Thiết lập giá trị checked cho checkbox
          onChange={(e) =>
            handleChangeNumber("autoRotate", e.target.checked ? 1 : 0)
          }
        />
      </div>
      {autoRotate === 1 && (
        <div className={styles.contain_input}>
          <label className={styles.label}>Tốc độ xoay:</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={speedRotate}
            onChange={(e) =>
              handleChangeNumber("speedRotate", parseFloat(e.target.value))
            }
          />
        </div>
      )}
    </div>
  );
};
export default Task2;
