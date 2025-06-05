import { useEffect, useRef, useState } from "react";
import styles from "../../styles/attachMap.module.css";
import MapLeaflet from "../../components/visitor/MapLeaflet";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import Swal from "sweetalert2";
import { attachLocation, fetchSpaces } from "../../redux/slices/DataSlice";

const AttachMap = () => {
  /**
   * Ref để cập nhật giá trị kích thước của map
   */
  const mapRef = useRef<L.Map | null>(null);
  const [points, setPoints] = useState<
    { lat: number; lng: number; spaceId: number }[]
  >([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(0);
  const [isAssign, setIsAssign] = useState(true);
  const [isRemove, setIsRemove] = useState(false);

  const spaces = useSelector((state: RootState) => state.data.spaces);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current!.invalidateSize();
      }, 300); // chờ animation transition xong
    }
  }, []);

  const handleSubmit = async () => {
    if (points.length === 0) {
      Swal.fire({
        title: "Lưu thất bại",
        text: "Vui lòng gán nhãn trước khi lưu.",
        icon: "info",
        toast: true,
        timer: 3000,
        position: "top-right",
        showCancelButton: false,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload = points.map((pt) => ({
        spaceId: pt.spaceId,
        location: JSON.stringify([pt.lat, pt.lng]),
      }));

      const response = await axios.post(
        "http://localhost:8080/api/admin/space/attachLocation",
        payload
      );
      if (response.data.data) {
        Swal.fire({
          title: "Thành công",
          text: "Đã lưu thành công.",
          icon: "success",
          toast: true,
          timer: 3000,
          position: "top-right",
          showCancelButton: false,
          showConfirmButton: false,
        });
        setPoints([]);
        dispatch(fetchSpaces());
      } else {
        Swal.fire({
          title: "Thất bại",
          text: "Lỗi khi gắn node.",
          icon: "error",
          toast: true,
          timer: 3000,
          position: "top-right",
          showCancelButton: false,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Thất bại",
        text: "Lỗi khi gắn node.",
        icon: "error",
        toast: true,
        timer: 3000,
        position: "top-right",
        showCancelButton: false,
        showConfirmButton: false,
      });
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
          if (!selectedSpaceId) {
            return;
          }
          dispatch(
            attachLocation({
              spaceId: selectedSpaceId,
              location: JSON.stringify([latlng.lat, latlng.lng]),
            })
          );
          setPoints((prev) => [
            ...prev,
            { lat: latlng.lat, lng: latlng.lng, spaceId: selectedSpaceId },
          ]);
          setIsAssign(false);
          setIsRemove(false);
          setSelectedSpaceId(0);
        }}
        points={points}
        setPoints={setPoints}
        isRemove={isRemove}
      />
      <div className={styles.controlPanel}>
        <button
          onClick={() => {
            setIsAssign((pre) => !pre);
          }}
        >
          {isAssign ? "Hủy" : "Gán nhãn"}
        </button>

        <select
          className={styles.custom_select}
          value={selectedSpaceId}
          onChange={(e) => setSelectedSpaceId(Number(e.target.value))}
        >
          <option value="">-- Chọn không gian --</option>
          {spaces.map((space) => (
            <option
              key={space.id}
              value={space.id}
              disabled={space.location !== null && space.location !== ""}
            >
              {space.name}
            </option>
          ))}
        </select>

        <button onClick={handleSubmit} disabled={isSaving}>
          Lưu
        </button>
        <button onClick={() => setIsRemove((pre) => !pre)} disabled={isSaving}>
          {isRemove ? "Hủy" : "Gỡ nhãn"}
        </button>
      </div>
    </div>
  );
};

export default AttachMap;
