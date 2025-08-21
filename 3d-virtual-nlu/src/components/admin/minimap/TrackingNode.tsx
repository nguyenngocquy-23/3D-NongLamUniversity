import { Background, MarkerType, ReactFlow } from "@xyflow/react";
import styles from "../../../styles/trackingNode.module.css";
import "@xyflow/react/dist/style.css";
import NodeItem from "./TrackingNodeItem";
import { HotspotNavigation } from "../../../redux/slices/HotspotSlice";
import React, { MutableRefObject } from "react";
import { PanoramaItem } from "../../../redux/slices/PanoramaSlice";
import {
  ImageCacheMap,
  useImageCache,
} from "../../../contexts/ImageCacheContext";

const nodeTypes = {
  customCircle: NodeItem,
};

type FlowProps = {
  panoramaList: PanoramaItem[];
  hotspotNavigations: HotspotNavigation[];
  imageRef: MutableRefObject<ImageCacheMap>;
};

const Flow: React.FC<FlowProps> = ({
  panoramaList,
  hotspotNavigations,
  imageRef,
}) => {
  const masterPanorama = React.useMemo(() => {
    return panoramaList.find((h) => h.config.status > 1);
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
        data: {
          name: masterPanorama.config.name,
          img:
            imageRef.current[masterPanorama.url]?.objectUrl ||
            masterPanorama.url,
        },
      },
      ...panoramaListExceptMasterNode.map((item, index) => ({
        id: item.id,
        type: "customCircle",
        position: { x: 200, y: index * 36 },
        data: {
          name: item.config.name,
          img: imageRef.current[item.url]?.objectUrl || item.url,
        },
      })),
    ];
  }, [masterPanorama, panoramaListExceptMasterNode]);

  // const edges = React.useMemo(() => {
  //   const result: any[] = [];
  //   const handledPairs = new Set<string>();

  //   return hotspotNavigations.map((item) => ({
  //     id: item.id,
  //     source: item.nodeId,
  //     target: item.targetNodeId,
  //     markerEnd: { type: MarkerType.Arrow, color: "#fff000", strokeWidth: 3 },
  //     style: {
  //       stroke: "#000",
  //     },
  //   }));

  // }, [hotspotNavigations]);
  const edges = React.useMemo(() => {
    const result: any[] = [];
    const handledPairs = new Set<string>();

    hotspotNavigations.forEach((item) => {
      const key = `${item.nodeId}-${item.targetNodeId}`;
      const reverseKey = `${item.targetNodeId}-${item.nodeId}`;

      // Nếu đã xử lý cặp ngược lại → bỏ qua
      if (handledPairs.has(reverseKey)) return;

      // Tìm hotspot ngược chiều (nếu có)
      const reverseHotspot = hotspotNavigations.find(
        (h) => h.nodeId === item.targetNodeId && h.targetNodeId === item.nodeId
      );

      const isBidirectional = !!reverseHotspot;

      if (isBidirectional) {
        result.push({
          id: `${item.id}-${reverseHotspot.id}`,
          source: item.nodeId,
          target: item.targetNodeId,
          style: {
            stroke: "#267026",
            strokeWidth: 2,
          },
        });

        handledPairs.add(key);
      } else {
        result.push({
          id: item.id,
          source: item.nodeId,
          target: item.targetNodeId,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#ff0033",
          },
          style: {
            stroke: "#ff0033",
            strokeWidth: 2,
          },
        });
      }
    });

    return result;
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
