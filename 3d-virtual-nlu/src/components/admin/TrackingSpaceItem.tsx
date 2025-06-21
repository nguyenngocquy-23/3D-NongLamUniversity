import { Handle, Position } from "@xyflow/react";
import { PanoramaItem, selectPanorama } from "../../redux/slices/PanoramaSlice";
import styles from "../../styles/trackingSpaceItem.module.css";
import { CiCirclePlus } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
type TrackingSpaceItemProps = {
  data: {
    img: string;
    name: string;
    numOfNodes: number;
    id: string;
    root: boolean;
  };
};

const TrackingSpaceItem: React.FC<TrackingSpaceItemProps> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentSelectId = useSelector(
    (state: RootState) => state.panoramas.currentSelectId
  );
  return (
    <div className={styles.tracking_item_container}>
      {/* HANDLE IN (target) */}
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
        isConnectable={false}
      />
      <img
        src={data.img}
        alt=""
        className={styles.item_img}
        style={{
          filter:
            currentSelectId == data.id ? "brightness(1.4)" : "grayscale(100%)",
        }}
      />
      <span
        className={styles.item_name}
        style={{
          color: currentSelectId == data.id ? "#267026" : "#000",
        }}
      >
        {data.id} - {data.name} ({data.numOfNodes})
      </span>
      <span
        onClick={() => {
          dispatch(selectPanorama(data.id));
        }}
        className={styles.add_link}
      >
        <CiCirclePlus className={styles.add_link_btn} />
      </span>
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
        isConnectable={false}
      />
    </div>
  );
};

export default TrackingSpaceItem;
