import { useDispatch, useSelector } from "react-redux";
import styles from "../../../styles/tasklistCT/task2.module.css";
import { RootState } from "../../../redux/Store";
import { updatePanoConfig } from "../../../redux/slices/PanoramaSlice";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { DEFAULT_ORIGINAL_Z } from "../../../utils/Constants";
// Tuỳ chỉnh thông số kỹ thuật.

type Task2Props = {
  cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
};

const Task2 = ({ cameraRef }: Task2Props) => {
  const dispatch = useDispatch();
  const { panoramaList, currentSelectId, currentSelectedPosition } =
    useSelector((state: RootState) => state.panoramas);

  const currentPanorama = panoramaList.find((p) => p.id === currentSelectId);
  // const currentPanorama = panoramaList[currentSelectedPosition];
  if (!currentPanorama) return null;

  const {
    autoRotate = 0,
    speedRotate = 1,
    lightIntensity = 2,
    positionX = 0,
    positionZ = DEFAULT_ORIGINAL_Z,
  } = currentPanorama.config ?? {};

  /**
   * Mặc định, trong Redux mỗi ảnh sẽ có position của camera riêng.
   * => Để hiển thị đúng của mỗi ảnh lên thanh điều chỉnh hướng mặc định thì:
   * + Ta cần chuyển vị trí toạ độ x,z về thành góc bao nhiêu độ.
   *          |
   *          |
   *       (-180/ 180)
   *          |
   * --(-90)-------(90)-------> (x)
   *          |
   *          * (0) (vị trí camera mặc định hướng về tâm, được coi là 0 độ)
   *          |
   *          |
   *          v  (z)
   * + Góc angle mặc định là 0 độ.
   * +++ originalZ: vị trí ban đầu của z, camera sẽ xoay quanh tâm vòng tròn có bán kính là originalZ.
   * +++ positionX = bán kính * cos(góc Angle)
   * +++ positionZ = bán kính * sin(góc Angle)
   * =>> Ta cần truy ngược lại angle từ positionX,Z.
   * cos(góc Angle) = posX/bán kính (X)
   * sin(góc Angle) = posZ/bán kính (Z)
   * sin(góc Angle) / cos(góc Angle) = tan (góc Angle) = Z/X
   *                               <==> góc Angle = atan2(Z,X)
   * Note : atan2 sử dụng để xác định góc phần tư của Z,X. trong khi atan có thể bị nhầm trường hợp nếu z âm x dương hoặc z dương x âm.
   */
  const getAngleFromXZ = (z: number, x: number): number => {
    const radians = Math.atan2(z, x);
    let degrees = (radians * 180) / Math.PI;
    if (degrees < 0) degrees += 360; // giá trị radian có thể âm.
    return degrees;
  };

  const [angle, setAngle] = useState<number>(0);

  useEffect(() => {
    if (currentPanorama?.config) {
      const newAngle = getAngleFromXZ(
        positionZ / DEFAULT_ORIGINAL_Z,
        positionX / DEFAULT_ORIGINAL_Z
      );
      setAngle(newAngle);
    }
  }, [currentSelectId]);

  const cameraPosition = useMemo((): [number, number, number] => {
    const radians = (angle * Math.PI) / 180;
    return [
      DEFAULT_ORIGINAL_Z * Math.cos(radians),
      0,
      DEFAULT_ORIGINAL_Z * Math.sin(radians),
    ];
  }, [angle]);

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
    setAngle(value); // Cập nhật góc - trigger useMemo + useEffect
  };

  useEffect(() => {
    if (cameraRef?.current) {
      console.log("[Basic-Config]: cameraRef current đã có chưa?");
      cameraRef.current.position.set(...cameraPosition);
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }

    // Optional: update Redux (chỉ lưu lại)
    dispatch(
      updatePanoConfig({
        id: currentPanorama.id,
        config: {
          positionX: cameraPosition[0],
          positionY: cameraPosition[1],
          positionZ: cameraPosition[2],
        },
      })
    );
  }, [cameraPosition]);

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
          min="1"
          max="8"
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
          } // Cập nhật autoRotate
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
      <div className={styles.contain_input}>
        <label className={styles.label}>Độ phóng to:</label>
        <input type="range" />
      </div>
    </div>
  );
};
export default Task2;
