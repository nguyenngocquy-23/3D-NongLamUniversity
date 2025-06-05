import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../../styles/visitor/map.module.css";
import { AROUND_MAP } from "../../utils/Constants";

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
  points,
}) => {
  const [markerPos, setMarkerPos] = useState<L.LatLng | null>(null);

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
      <Marker position={centerPosition}>
        <Tooltip
          direction="top"
          offset={[-15, -10]}
          className={styles.tooltip}
        >
          Trường Đại học Nông Lâm TP.HCM
        </Tooltip>
      </Marker>

      {points?.map((point, idx) => (
        <Marker key={idx} position={{ lat: point.lat, lng: point.lng }}>
          <Tooltip
            offset={[-15, -10]}
            direction="top"
            className={styles.tooltip}
          >
            {point.label}
          </Tooltip>
        </Marker>
      ))}

      {/* Bắt sự kiện click trên map, gọi về parent */}
      <ClickHandler
        onMapClick={(latlng) => {
          setMarkerPos(latlng);
          onMapClick?.(latlng);
        }}
      />

      {/* 5. Custom control để reset về center */}
      <ResetCenterControl center={centerPosition} />
    </MapContainer>
  );
};

export default MapLeaflet;
