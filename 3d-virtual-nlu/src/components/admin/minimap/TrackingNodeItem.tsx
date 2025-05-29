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
      // style={{ width: "70px", height: "70px" }}
    >
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
      <img src={data.img} alt="panoramaItem" className={styles.node_img} />
      {/* <span className={styles.node_name}>{data.name}</span> */}
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

export default NodeItem;
