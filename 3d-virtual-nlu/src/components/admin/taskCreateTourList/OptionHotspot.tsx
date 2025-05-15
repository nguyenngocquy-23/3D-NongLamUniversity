import { Html } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import styles from "../../../styles/optionHotspot.module.css";

interface PanoramaSelectProps {
  hotspotId: string;
  setCurrentHotspotId: (val: string | null) => void;
  position: [number, number, number];
  idHotspot?: string;
  onClose?: () => void;
  onEdit?: () => void; // optional: gọi nếu muốn mở modal sửa chẳng hạn
}

const OptionHotspot = ({
  hotspotId,
  setCurrentHotspotId,
  position,
  //   idHotspot,
  onClose,
}: //   onEdit,
{
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

  //   const handleDelete = () => {
  //     if (confirm("Bạn có chắc muốn xóa hotspot này không?")) {
  //       dispatch(deleteHotspot(idHotspot));
  //       onClose(); // đóng menu
  //     }
  //   };

  const handleEdit = () => {
    console.log('hotspotId...', hotspotId)
    setCurrentHotspotId(hotspotId);
    onClose();
  };

  return (
    <Html
      position={position}
      distanceFactor={50}
      transform={false}
      occlude={false}
    >
      <div ref={menuRef} className={styles.container}>
        <div className={styles.update_option} onClick={() => {handleEdit()}}>
          ✏️ Cập nhật
        </div>
        <div
          className={styles.remove_option}
          //   onClick={handleDelete}
        >
          🗑️ Xóa
        </div>
      </div>
    </Html>
  );
};

export default OptionHotspot;
