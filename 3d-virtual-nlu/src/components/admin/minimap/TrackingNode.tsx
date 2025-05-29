import { Background, ReactFlow } from "@xyflow/react";
import styles from "../../../styles/trackingNode.module.css";
import "@xyflow/react/dist/style.css";
import NodeItem from "./TrackingNodeItem";

const nodeTypes = {
  customCircle: NodeItem,
};
const nodes = [
  {
    id: "1",
    type: "customCircle",
    position: { x: 0, y: 0 },
    data: { name: "Hello", img: "/khoa.jpg" },
  },
  {
    id: "2",
    type: "customCircle",
    position: { x: 300, y: 20 },
    data: { name: "Hello 2", img: "/khoa.jpg" },
  },
  {
    id: "3",
    type: "customCircle",
    position: { x: 300, y: 100 },
    data: { name: "Hello 3", img: "/khoa.jpg" },
  },
];

const edges = [
  {
    id: "2-3",
    source: "1",
    target: "2",
    animated: true,
  },
  {
    id: "21-3",
    source: "1",
    target: "3",
    animated: true,
  },
];

function Flow() {
  return (
    <div className={styles.tracking_container}>
      <ReactFlow
        nodes={nodes}
        fitView
        edges={edges}
        nodeTypes={nodeTypes}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnScroll={false}
        panOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        selectionOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default Flow;
