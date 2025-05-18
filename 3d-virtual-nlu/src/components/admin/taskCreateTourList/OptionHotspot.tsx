import { Html } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../../styles/optionHotspot.module.css";
import { removeHotspot } from "../../../redux/slices/HotspotSlice";
import { RootState } from "../../../redux/Store";

const OptionHotspot = ({
  hotspotId,
  setCurrentHotspotId,
  position,
  onClose,
}: {
  hotspotId: string;
  setCurrentHotspotId: (val: string | null) => void;
  position: [number, number, number];
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose(); // 👈 đóng khi click ngoài
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleDelete = () => {
    if (confirm("Bạn có chắc muốn xóa hotspot này không?")) {
      dispatch(removeHotspot({ hotspotId }));
      onClose();
    }
  };

  const handleEdit = () => {
    setCurrentHotspotId(hotspotId);
    onClose();
  };

  const hotspot = useSelector((state: RootState) =>
    state.hotspots.hotspotList.find((h) => h.id === hotspotId)
  );

  return (
    <Html
      position={position}
      distanceFactor={100}
      transform={false}
      occlude={false}
    >
      <div ref={menuRef} className={styles.container}>
        <div
          className={styles.update_option}
          onClick={() => {
            handleEdit();
          }}
        >
          ✏️ Cập nhật
        </div>

        <div className={styles.remove_option} onClick={handleDelete}>
          🗑️ Xóa
        </div>
      </div>
    </Html>
  );
};

export default OptionHotspot;
