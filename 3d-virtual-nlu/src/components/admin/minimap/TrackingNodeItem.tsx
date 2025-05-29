import React from "react";
import styles from "../../../styles/trackingNodeItem.module.css";
import { Handle, Position } from "@xyflow/react";
type NodeItemProps = {
  data: { img: string; name: string };
};

const NodeItem: React.FC<NodeItemProps> = ({ data }) => {
  return (
    <div
      className={styles.node_container}
      style={{ width: "70px", height: "70px" }}
    >
      {/* HANDLE IN (target) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
        isConnectable={false}
      />
      <img src={data.img} alt="panoramaItem" className={styles.node_img} />
      <span className={styles.node_name}>{data.name}</span>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
        isConnectable={false}
      />
    </div>
  );
};

export default NodeItem;
