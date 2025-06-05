import { useEffect, useRef, useState } from "react";
import styles from "../../styles/attachMap.module.css";
import MapLeaflet from "../../components/visitor/MapLeaflet";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";

const AttachMap = () => {
  /**
   * Ref để cập nhật giá trị kích thước của map
   */
  const mapRef = useRef<L.Map | null>(null);
  const [points, setPoints] = useState<
    { lat: number; lng: number; label: string }[]
  >([]);
  const [isAssign, setIsAssign] = useState(true);

  const [selectedSpace, setSelectedSpace] = useState("");
  const spaces = useSelector((state: RootState) => state.data.spaces);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current!.invalidateSize();
      }, 300); // chờ animation transition xong
    }
  }, []);

  const handleSubmit = async () => {
    if (points.length === 0) {
      alert("Không có điểm nào để lưu.");
      return;
    }

    try {
      setIsSaving(true);
      await axios.post("/api/save-coordinates", points);
      alert("Đã lưu thành công!");
      setPoints([]); // reset sau khi lưu xong
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <MapLeaflet
        mapRef={mapRef}
        onMapClick={(latlng) => {
          if (!isAssign) return;
          if (!selectedSpace) {
            return;
          }
          setPoints((prev) => [
            ...prev,
            { lat: latlng.lat, lng: latlng.lng, label: selectedSpace },
          ]);
          setIsAssign(false);
        }}
        points={points}
      />
      <div className={styles.controlPanel}>
        <button onClick={() => setIsAssign(true)} disabled={isAssign}>
          {isSaving ? "Đang lưu..." : "Gán nhãn"}
        </button>

        <select
          value={selectedSpace}
          onChange={(e) => setSelectedSpace(e.target.value)}
        >
          <option value="">-- Chọn không gian --</option>
          {spaces.map((space) => (
            <option key={space.id} value={space.code}>{space.name}</option>
          ))}
        </select>

        <button onClick={handleSubmit} disabled={isSaving}>
          Lưu
        </button>
      </div>
    </div>
  );
};

export default AttachMap;
