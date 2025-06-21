import React, { useCallback } from "react";
import { ReactFlow, MarkerType, Background, Controls } from "@xyflow/react";
import styles from "../styles/trackingNode.module.css";
import "@xyflow/react/dist/style.css";
import TrackingSpaceItem from "./admin/TrackingSpaceItem";
import { PanoramaItem } from "../redux/slices/PanoramaSlice";
import { HotspotNavigation } from "../redux/slices/HotspotSlice";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";

type FlowProps = {
  panoramaList: PanoramaItem[];
  hotspotNavigations: HotspotNavigation[];
  spaceId?: string;
};

const nodeTypes = {
  customItem: TrackingSpaceItem,
};

const TrackingSpace: React.FC<FlowProps> = ({
  panoramaList,
  hotspotNavigations,
  spaceId,
}) => {
  /**
   * REDUX
   */
  const currentSpace = useSelector((state: RootState) =>
    state.data.spaces.find((h) => h.id === spaceId)
  );

  const masterPanoramaInSpace = React.useMemo(() => {
    return panoramaList.find((h) => h.id === currentSpace);
  }, [panoramaList]);

  /**
   * Props
   */

  const masterPanoramaRegular = React.useMemo(() => {
    return panoramaList.filter((h) => h.id !== masterPanoramaInSpace?.id);
  }, [panoramaList, masterPanoramaInSpace]);

  /**
   * Thiết lập hiển thị điểm trong React Flow
   */

  const nodes = React.useMemo(() => {
    if (!masterPanoramaInSpace) return [];
    return [
      {
        id: masterPanoramaInSpace.id,
        type: "customItem",
        position: { x: 0, y: 200 },
        data: {
          name: masterPanoramaInSpace.config.name,
          img: masterPanoramaInSpace.url,
        },
      },
      ...masterPanoramaRegular.map((item, index) => ({
        id: item.id,
        type: "customItem",
        position: { x: 200, y: index * 36 },
        data: { name: item.config.name, img: item.url },
      })),
    ];
  }, [masterPanoramaInSpace, masterPanoramaRegular]);

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
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        selectionOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
export default TrackingSpace;
