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
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { DEFAULT_ORIGINAL_Z } from "../../../utils/Constants";
// Tuỳ chỉnh thông số kỹ thuật.

type Task2Props = {
  cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
  controlsRef?: React.RefObject<any>;
  isLocked?: boolean;
};

const Task2 = ({ cameraRef, controlsRef, isLocked }: Task2Props) => {
  const dispatch = useDispatch();
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );

  const currentPanorama = panoramaList.find((p) => p.id === currentSelectId);
  if (!currentPanorama) return null;

  const {
    brightness = 0,
    contrast = 1,
    saturation = 1,
    grayscale = 0,
    exposure = 1,
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
    field:
      | "lightIntensity"
      | "brightness"
      | "contrast"
      | "saturation"
      | "grayscale"
      | "exposure",
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

  const setDefaultDirection = () => {
    if (cameraRef?.current && controlsRef?.current) {
      cameraRef.current.position.set(0, 0, DEFAULT_ORIGINAL_Z);
      cameraRef.current.updateMatrixWorld();
      controlsRef.current.update();
    }
  };

  return (
    <div className={styles.task2}>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <span>Hướng mặc định/Default:</span>
          <div className={styles.contain_safe}>
            {unlockDefault ? (
              <div className={styles.lock}>
                <span
                  className={styles.lock_btn}
                  onClick={() => {
                    setUnlockDefault(!unlockDefault);
                  }}
                >
                  <FaLockOpen />
                </span>
              </div>
            ) : (
              <div className={styles.lock}>
                <span
                  className={styles.lock_btn}
                  onClick={() => {
                    setDefaultDirection();
                    setUnlockDefault(!unlockDefault);
                  }}
                >
                  <FaLock />
                </span>
              </div>
            )}
          </div>
        </div>
        <div
          className={`${styles.contain_input_content} ${
            unlockDefault ? "" : styles.contain_blur
          }`}
        >
          <div className={styles.contain_label}>{angle}</div>
          <div className={styles.contain_edit}>
            <input
              disabled={!unlockDefault}
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
      </div>

      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <span>Vùng sáng:</span>
        </div>
        <div
          className={`${styles.contain_input_content} ${
            isLocked ? styles.contain_blur : ""
          }`}
        >
          <div className={styles.contain_label}>{lightIntensity}</div>
          <div className={styles.contain_edit}>
            <input
              disabled={isLocked}
              type="range"
              min="0.5"
              max="6"
              step="0.1"
              value={lightIntensity}
              onChange={(e) =>
                handleChangeNumber("lightIntensity", parseFloat(e.target.value))
              }
            />
            <progress max="6.5" value={lightIntensity}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <CiBrightnessDown />
          <span>Ánh sáng/Brightness:</span>
        </div>
        <div
          className={`${styles.contain_input_content} ${
            isLocked ? styles.contain_blur : ""
          }`}
        >
          <div className={styles.contain_label}>{brightness}</div>
          <div className={styles.contain_edit}>
            <input
              disabled={isLocked}
              type="range"
              name="brightness"
              id="brightness"
              min={-0.5}
              max={0.5}
              step={0.1}
              value={brightness}
              onChange={(e) => {
                handleChangeNumber("brightness", parseFloat(e.target.value));
              }}
            />
            <progress max="1" value={brightness + 0.5}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <IoIosContrast />
          <span>Tương phản/Contrast:</span>
        </div>
        <div
          className={`${styles.contain_input_content} ${
            isLocked ? styles.contain_blur : ""
          }`}
        >
          <div className={styles.contain_label}>{contrast}</div>
          <div className={styles.contain_edit}>
            <input
              disabled={isLocked}
              type="range"
              name="contrast"
              id="contrast"
              min={0.5}
              max={2}
              step={0.1}
              value={contrast}
              onChange={(e) => {
                handleChangeNumber("contrast", parseFloat(e.target.value));
              }}
            />
            <progress max="1.5" value={contrast - 0.5}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <IoColorFilter />
          <span>Độ bão hoà/Saturation:</span>
        </div>
        <div
          className={`${styles.contain_input_content} ${
            isLocked ? styles.contain_blur : ""
          }`}
        >
          <div className={styles.contain_label}>{saturation}</div>
          <div className={styles.contain_edit}>
            <input
              disabled={isLocked}
              type="range"
              name="saturation"
              id="saturation"
              min={0}
              max={2}
              step={0.1}
              value={saturation}
              onChange={(e) => {
                handleChangeNumber("saturation", parseFloat(e.target.value));
              }}
            />
            <progress max="2" value={saturation}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <TbBrightness />
          <span>Trắng đen/Grayscale:</span>
        </div>
        <div
          className={`${styles.contain_input_content} ${
            isLocked ? styles.contain_blur : ""
          }`}
        >
          <div className={styles.contain_label}>{grayscale}</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              name="grayscale"
              id="grayscale"
              min={0}
              max={1}
              step={0.1}
              value={grayscale}
              onChange={(e) => {
                handleChangeNumber("grayscale", parseFloat(e.target.value));
              }}
            />
            <progress max="1" value={grayscale}></progress>
          </div>
        </div>
      </div>
      <div className={styles.contain_input}>
        <div className={styles.contain_input_title}>
          <MdExposure />
          <span>Phơi sáng/Exposure:</span>
        </div>
        <div
          className={`${styles.contain_input_content} ${
            isLocked ? styles.contain_blur : ""
          }`}
        >
          <div className={styles.contain_label}>{exposure}</div>
          <div className={styles.contain_edit}>
            <input
              type="range"
              name="exposure"
              id="exposure"
              min={0}
              max={2}
              step={0.1}
              value={exposure}
              onChange={(e) => {
                handleChangeNumber("exposure", parseFloat(e.target.value));
              }}
            />
            <progress max="2" value={exposure}></progress>
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
