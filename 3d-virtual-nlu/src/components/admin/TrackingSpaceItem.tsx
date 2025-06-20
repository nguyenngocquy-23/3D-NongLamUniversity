import { Handle, Position } from "@xyflow/react";
import { PanoramaItem } from "../../redux/slices/PanoramaSlice";
import styles from "../../styles/trackingSpaceItem.module.css";
type TrackingSpaceItemProps = {
  data: { img: string; name: string };
};

const TrackingSpaceItem: React.FC<TrackingSpaceItemProps> = ({ data }) => {
  return (
    <div className={styles.tracking_item_container}>
      {/* HANDLE IN (target) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
        isConnectable={false}
      />
      <img src={data.img} alt="" className={styles.item_img} />
      <span className={styles.item_name}>{data.name}</span>
      <Handle
        type="source"
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
