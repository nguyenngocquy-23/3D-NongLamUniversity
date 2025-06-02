import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../../styles/visitor/map.module.css";

//10.871411929060356, 106.7917907218185
const centerPosition: [number, number] = [
  10.871411929060356, 106.7917907218185,
]; // Trường ĐH Nông Lâm
const southWestBound: [number, number] = [10.82, 106.75]; // Tây Nam
const northEastBound: [number, number] = [10.91, 106.84]; // Đông Bắc

const MapLeaflet = ({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) => {
  useEffect(() => {
    // Tạo bản đồ và thiết lập view, vùng giới hạn
    const map = L.map("map", {
      center: centerPosition,
      zoom: 16,
      minZoom: 15,
      maxZoom: 18,
      maxBounds: L.latLngBounds(southWestBound, northEastBound),
      maxBoundsViscosity: 1.0, // chặn kéo ra ngoài vùng giới hạn
    });

    mapRef.current = map;

    // Thêm layer tile OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Thêm marker cho Trường ĐH Nông Lâm
    L.marker(centerPosition)
      .addTo(map)
      // .bindPopup("Trường Đại học Nông Lâm TP.HCM")
      .bindTooltip("Trường Đại học Nông Lâm TP.HCM",
        {
          direction: 'top',
          className: styles.tooltip,
          offset: [-15,-10],
        }
      )
      .openPopup();

    // Tạo control custom nút reset center
    const resetControl = L.Control.extend({
      options: { position: "topleft" },

      onAdd: function () {
        const container = L.DomUtil.create(
          "button",
          "leaflet-bar leaflet-control leaflet-control-custom"
        );
        container.title = "Quay về vị trí trung tâm";
        // container.innerHTML = "🏠";
        container.innerHTML = "📍";
        container.style.width = "30px";
        container.style.height = "30px";
        container.style.backgroundColor = "#fff";
        container.style.cursor = "pointer";
        container.style.display = "flex";
        container.style.justifyContent = "center";

        container.onclick = function () {
          map.setView(centerPosition, 16);
        };

        return container;
      },
    });

    map.addControl(new resetControl());

    // Cleanup map khi component unmount
    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" className={styles.map}></div>;
};

export default MapLeaflet;
