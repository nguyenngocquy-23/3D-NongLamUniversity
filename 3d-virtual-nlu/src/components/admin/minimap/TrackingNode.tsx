import { Background, MarkerType, ReactFlow } from "@xyflow/react";
import styles from "../../../styles/trackingNode.module.css";
import "@xyflow/react/dist/style.css";
import NodeItem from "./TrackingNodeItem";
import { HotspotNavigation } from "../../../redux/slices/HotspotSlice";
import React from "react";
import { PanoramaItem } from "../../../redux/slices/PanoramaSlice";

const nodeTypes = {
  customCircle: NodeItem,
};

type FlowProps = {
  panoramaList: PanoramaItem[];
  hotspotNavigations: HotspotNavigation[];
};

const Flow: React.FC<FlowProps> = ({ panoramaList, hotspotNavigations }) => {
  const masterPanorama = React.useMemo(() => {
    return panoramaList.find((h) => h.config.status === 2);
  }, [panoramaList]);

  const panoramaListExceptMasterNode = React.useMemo(() => {
    return panoramaList.filter((h) => h.id !== masterPanorama?.id);
  }, [panoramaList, masterPanorama]);

  const nodes = React.useMemo(() => {
    if (!masterPanorama) return [];
    return [
      {
        id: masterPanorama.id,
        type: "customCircle",
        position: { x: 0, y: 54 },
        data: { name: masterPanorama.config.name, img: masterPanorama.url },
      },
      ...panoramaListExceptMasterNode.map((item, index) => ({
        id: item.id,
        type: "customCircle",
        position: { x: 200, y: index * 36 },
        data: { name: item.config.name, img: item.url },
      })),
    ];
  }, [masterPanorama, panoramaListExceptMasterNode]);

  const edges = React.useMemo(() => {
    return hotspotNavigations.map((item) => ({
      id: item.id,
      source: item.nodeId,
      target: item.targetNodeId,
      animated: true,
      markerEnd: { type: MarkerType.Arrow, color: "#fff000", strokeWidth: 3 },
      style: {
        stroke: "#000",
      },
    }));
  }, [hotspotNavigations]);

  return (
    <div className={styles.tracking_container}>
      <ReactFlow
        nodes={nodes}
        fitView
        edges={hotspotNavigations.length > 0 ? edges : []}
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
      ></ReactFlow>
    </div>
  );
};

export default Flow;
