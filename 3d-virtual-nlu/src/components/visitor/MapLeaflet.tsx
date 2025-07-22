import React, { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../../styles/visitor/map.module.css";
import { AROUND_MAP, perPage } from "../../utils/Constants";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import {
  fetchAllSpaces,
  fetchSpaces,
  removeLocation,
  setDefaultNode,
} from "../../redux/slices/DataSlice";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URLS } from "../../env";

const customIcon = L.divIcon({
  className: "",
  html: `<div class="${styles.customIcon}">🗑</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const centerPosition: [number, number] = [
  10.871411929060356, 106.7917907218185,
]; // Trường ĐH Nông Lâm
const southWestBound: [number, number] = [
  centerPosition[0] - AROUND_MAP,
  centerPosition[1] - AROUND_MAP,
]; // Tây Nam
const northEastBound: [number, number] = [
  centerPosition[0] + AROUND_MAP,
  centerPosition[1] + AROUND_MAP,
]; // Đông Bắc

interface MapLeafletProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  onMapClick?: (latlng: L.LatLng) => void;
  points?: any[];
  isRemove?: boolean;
  setPoints?: React.Dispatch<React.SetStateAction<any[]>>;
  spaceId?: number;
  spaces?: any[];
}

// Component con để lắng nghe sự kiện click trên map
const ClickHandler: React.FC<{ onMapClick: (latlng: L.LatLng) => void }> = ({
  onMapClick,
}) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// 1. Component để thêm custom control “reset center”
const ResetCenterControl: React.FC<{ center: [number, number] }> = ({
  center,
}) => {
  const map = useMapEvents({});
  useEffect(() => {
    const ctl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: () => {
        const btn = L.DomUtil.create(
          "button",
          "leaflet-bar leaflet-control leaflet-control-custom"
        );
        btn.title = "Quay về vị trí trung tâm";
        btn.innerHTML = "📍";
        Object.assign(btn.style, {
          width: "30px",
          height: "30px",
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        });
        btn.onclick = () => {
          map.setView(center, 16);
        };
        return btn;
      },
    });
    const controlInstance = new ctl();
    map.addControl(controlInstance);
    return () => {
      map.removeControl(controlInstance);
    };
  }, [map, center]);
  return null;
};

// 2. Component chính dùng JSX của react-leaflet
const MapLeaflet: React.FC<MapLeafletProps> = ({
  mapRef,
  onMapClick,
  isRemove,
  setPoints,
  spaceId,
  spaces: propsSpaces,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const listSpaces = useSelector((state: RootState) => state.data.allSpaces);

  useEffect(() => {
    if (!propsSpaces || propsSpaces.length === 0) {
      dispatch(fetchAllSpaces());
    }
  }, [dispatch, propsSpaces]);

  const spacesToUse = (!setPoints ? propsSpaces : listSpaces) ?? [];
  // propsSpaces && propsSpaces.length > 0 ? propsSpaces : listSpaces;

  const maker = spacesToUse.filter(
    (s) => s.location !== null && s.location !== ""
  );

  const handleRemove = async (spaceId: number) => {
    const result = await Swal.fire({
      title: "Xóa nhãn",
      text: "Bạn có chắc chắn muốn gỡ nhãn này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Gỡ",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          API_URLS.ADMIN_REMOVE_SPACE_LOCATION,
          { spaceId: spaceId }
        );
        if (response.data.data) {
          Swal.fire({
            title: "Thành công",
            text: "Gỡ thành công.",
            icon: "success",
            toast: true,
            timer: 2000,
            timerProgressBar: true,
            position: "top-right",
            showCancelButton: false,
            showConfirmButton: false,
          });
          if (setPoints) {
            setPoints?.((prev: any[]) =>
              prev.filter((point: any) => point.spaceId !== spaceId)
            );
          }
          dispatch(
            removeLocation({
              spaceId: spaceId,
            })
          );
        } else {
          Swal.fire({
            title: "Thất bại",
            text: "Lỗi khi gỡ node.",
            icon: "error",
            toast: true,
            timer: 2000,
            timerProgressBar: true,
            position: "top-right",
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Thất bại",
          text: "Lỗi khi gỡ node.",
          icon: "error",
          toast: true,
          timer: 2000,
          timerProgressBar: true,
          position: "top-right",
          showCancelButton: false,
          showConfirmButton: false,
        });
      }
    }
  };

  const handleSelectSpace = async (spaceId: number) => {
    const nodeId = propsSpaces?.find((h: any) => h.id === spaceId).masterNodeId;

    try {
      const response = await axios.post(API_URLS.NODE_BY_ID, {
        nodeId: nodeId,
      });
      if (response.data.data) {
        dispatch(setDefaultNode(response.data.data));
      } else {
        Swal.fire({
          title: "Thất bại",
          text: "Không gian đang bảo trì",
          icon: "warning",
          toast: true,
          timer: 2000,
          position: "top-right",
          showCancelButton: false,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Thất bại",
        text: "Không gian đang bảo trì.",
        icon: "warning",
        toast: true,
        timer: 2000,
        position: "top-right",
        showCancelButton: false,
        showConfirmButton: false,
      });
    }
  };

  if (spacesToUse.length == 0) {
    return null;
  }

  return (
    <MapContainer
      center={centerPosition}
      zoom={16}
      minZoom={15}
      maxZoom={18}
      maxBounds={L.latLngBounds(southWestBound, northEastBound)}
      maxBoundsViscosity={1.0}
      className={styles.map}
      ref={mapRef}
    >
      {/* 3. TileLayer OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* 4. Marker ở centerPosition với Tooltip */}
      {/* <Marker position={centerPosition}>
        <Tooltip direction="top" offset={[-15, -10]} className={styles.tooltip}>
          Trường Đại học Nông Lâm TP.HCM
        </Tooltip>
      </Marker> */}

      {maker.length > 0
        ? maker.map((space: any) => {
            const location = JSON.parse(space.location);
            const lat = location[0];
            const lng = location[1];
            const defaultIcon = L.divIcon({
              className: "",
              html: `<div class="${styles.defaultIcon} ${
                spaceId == space.id ? styles.pulse : ""
              }"
              style="background: url(${space.url});
                    ${spaceId == space.id ? "border: 3px solid blue;" : ""}">
              </div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });
            return (
              <Marker
                key={space.id}
                position={{ lat: lat, lng: lng }}
                icon={isRemove ? customIcon : defaultIcon}
                // icon={isRemove ? customIcon : new L.Icon.Default()}
                eventHandlers={{
                  click: () => {
                    isRemove
                      ? handleRemove(space.id)
                      : !setPoints
                      ? handleSelectSpace(space.id)
                      : "";
                  },
                }}
              >
                <Tooltip
                  offset={[0, -15]}
                  direction="top"
                  className={styles.tooltip}
                >
                  <div className={styles.customTooltip}>
                    <img src={space.url} alt="Image" />
                    <div className={styles.text}>
                      {spacesToUse.find((s) => s.id === space.id)?.name}
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })
        : ""}

      {/* Bắt sự kiện click trên map, gọi về parent */}
      <ClickHandler
        onMapClick={(latlng) => {
          onMapClick?.(latlng);
        }}
      />

      {/* 5. Custom control để reset về center */}
      <ResetCenterControl center={centerPosition} />
    </MapContainer>
  );
};

export default MapLeaflet;
