import React, { useCallback } from "react";
import { ReactFlow, MarkerType, Background, Controls } from "@xyflow/react";
import styles from "../styles/trackingNode.module.css";
import "@xyflow/react/dist/style.css";
import TrackingSpaceItem from "./admin/TrackingSpaceItem";
import { PanoramaItem } from "../redux/slices/PanoramaSlice";
import { HotspotNavigation } from "../redux/slices/HotspotSlice";

type FlowProps = {
  spaceId?: string;
  panoramaList: PanoramaItem[];
  hotspotNavigations: HotspotNavigation[];
};

const nodeTypes = {
  customItem: TrackingSpaceItem,
};

const TrackingSpace: React.FC<FlowProps> = ({
  panoramaList,
  hotspotNavigations,
}) => {
  const defaultInSpace = React.useMemo(() => {
    return panoramaList.find((h) => h.config.status === 2);
  }, [panoramaList]);

  const panoramaListExceptMasterNode = React.useMemo(() => {
    return panoramaList.filter((h) => h.id !== defaultInSpace?.id);
  }, [panoramaList, defaultInSpace]);

  const nodes = React.useMemo(() => {
    if (!defaultInSpace) return [];
    return [
      {
        id: defaultInSpace.id,
        type: "customItem",
        position: { x: 0, y: 54 },
        data: { name: defaultInSpace.config.name, img: defaultInSpace.url },
      },
      ...panoramaListExceptMasterNode.map((item, index) => ({
        id: item.id,
        type: "customItem",
        position: { x: 500, y: index * 100 },
        data: { name: item.config.name, img: item.url },
      })),
    ];
  }, [defaultInSpace, panoramaListExceptMasterNode]);

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
        edges={hotspotNavigations.length > 0 ? edges : []}
        nodeTypes={nodeTypes}
        // zoomOnScroll={false}
        // zoomOnPinch={false}
        // panOnScroll={false}
        // panOnDrag={false}
        // nodesDraggable={false}
        // nodesConnectable={false}
        // elementsSelectable={false}
        // selectionOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
export default TrackingSpace;
