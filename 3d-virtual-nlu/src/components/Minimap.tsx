import { Html } from "@react-three/drei";
import styles from "../styles/minimap.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import { selectPanorama } from "../redux/slices/PanoramaSlice";
import { RiEdit2Line } from "react-icons/ri";
import { MdZoomOutMap } from "react-icons/md";

const MiniMap = () => {
  const handleSelectNode = (id: string) => {
    dispatch(selectPanorama(id));
  };

  const dispatch = useDispatch();

  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  return (
    <Html transform={false} occlude={false} className={styles.html_inner}>
      <div className={styles.minimap_container}>
        <div className={styles.minimap_header}>
          <MdZoomOutMap />
          <RiEdit2Line />
          {panoramaList.map((item) => (
            <div key={item.id} className={styles.node}>
              <div
                className={` ${styles.node_view}  ${
                  item.id === currentSelectId ? styles.nodeSelected : ""
                }`}
                onClick={() => handleSelectNode(item.id)}
              >
                <img
                  src={item.url}
                  alt={item.config.name}
                  className={styles.thumbnail_node}
                />
              </div>
              {/* <span className={styles.name_node}>{item.config.name}</span> */}
            </div>
          ))}
        </div>
        <div className={styles.minimap_content}>
          <img src="/khoa.jpg" alt="panorama" className={styles.master_node} />
          <div
            className={styles.rotation_node}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `conic-gradient(
                from ${322.5}deg,
                rgba(255,255,255,0.6) ${0}deg ${75}deg,
                transparent ${75}deg 360deg
              )`,
              transformOrigin: "center center",
            }}
          ></div>
        </div>
      </div>
    </Html>
  );
};

export default MiniMap;
