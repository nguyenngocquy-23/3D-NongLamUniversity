import { useDispatch, useSelector } from "react-redux";
import styles from "../../../styles/tasklistCT/task2.module.css";
import { RootState } from "../../../redux/Store";
import { updatePanoConfig } from "../../../redux/slices/PanoramaSlice";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { degreeToRadian, radianToDegree } from "../../../utils/MathUtils";
import { CiBrightnessDown } from "react-icons/ci";
import { IoIosContrast } from "react-icons/io";
import { MdExposure } from "react-icons/md";
import { TbBrightness } from "react-icons/tb";
import { IoColorFilter } from "react-icons/io5";
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
  const [unlockDefault, setUnlockDefault] = useState<boolean>(false);

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
        <span>Hướng mặc định/Default:</span>
        <div
          className={`${styles.contain_input_content} ${
            unlockDefault ? styles.contain_blur : ""
          }`}
        >
          <div className={styles.contain_label}>{angle}</div>
          <div className={styles.contain_edit}>
            <input
              disabled={unlockDefault}
              type="range"
              min="0"
              max="360"
              step="1"
              value={angle}
              className={styles.name_input}
              placeholder="Hướng nhìn"
              onChange={(e) => handleAngleChange(Number(e.target.value))}
            />
            <progress max="360" value={angle}></progress>
          </div>
        </div>
        <div className={styles.contain_safe}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={unlockDefault}
              onChange={() => setUnlockDefault(!unlockDefault)}
            />
            <span>
              <em></em>
              <strong></strong>
            </span>
          </label>
        </div>
      </div>

      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <span>Vùng sáng:</span>
        </div>
        <div className={styles.contain_input_content}>
          <div className={styles.contain_label}>{lightIntensity}</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              min="1"
              max="8"
              step="0.1"
              value={lightIntensity}
              onChange={(e) =>
                handleChangeNumber("lightIntensity", parseFloat(e.target.value))
              }
            />
            <progress max="3" value={lightIntensity}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <CiBrightnessDown />
          <span>Ánh sáng/Brightness:</span>
        </div>
        <div className={styles.contain_input_content}>
          <div className={styles.contain_label}>2</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              name="opacity"
              id="opacity"
              min={0}
              max={1}
              step={0.1}
              value={2}
              onChange={(e) => {}}
            />
            <progress max="3" value={2}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <IoIosContrast />
          <span>Tương phản/Contrast:</span>
        </div>
        <div className={styles.contain_input_content}>
          <div className={styles.contain_label}>2</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              name="opacity"
              id="opacity"
              min={0}
              max={1}
              step={0.1}
              value={2}
              onChange={(e) => {}}
            />
            <progress max="3" value={2}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <IoColorFilter />
          <span>Độ bão hoà/Saturation:</span>
        </div>
        <div className={styles.contain_input_content}>
          <div className={styles.contain_label}>2</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              name="opacity"
              id="opacity"
              min={0}
              max={1}
              step={0.1}
              value={2}
              onChange={(e) => {}}
            />
            <progress max="3" value={2}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <TbBrightness />
          <span>Trắng đen/Grayscale:</span>
        </div>
        <div className={styles.contain_input_content}>
          <div className={styles.contain_label}>2</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              name="opacity"
              id="opacity"
              min={0}
              max={1}
              step={0.1}
              value={2}
              onChange={(e) => {}}
            />
            <progress max="3" value={0.5}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <MdExposure />
          <span>Phơi sáng/Exposure:</span>
        </div>
        <div className={styles.contain_input_content}>
          <div className={styles.contain_label}>2</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              name="opacity"
              id="opacity"
              min={0}
              max={1}
              step={0.1}
              value={2}
              onChange={(e) => {}}
            />
            <progress max="3" value={2}></progress>
          </div>
        </div>
      </div>

      {/* <div className={styles.contain_input}>
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
      )} */}
    </div>
  );
};
export default Task2;
