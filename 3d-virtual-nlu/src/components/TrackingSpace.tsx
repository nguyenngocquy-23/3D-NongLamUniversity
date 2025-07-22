import React, { useCallback } from "react";
import { ReactFlow, MarkerType, Background, Controls } from "@xyflow/react";
import styles from "../styles/trackingSpace.module.css";
import "@xyflow/react/dist/style.css";
import TrackingSpaceItem from "./admin/TrackingSpaceItem";
import { PanoramaItem } from "../redux/slices/PanoramaSlice";
import { HotspotNavigation } from "../redux/slices/HotspotSlice";
import { transformUrlToThumbnail } from "../utils/getCloudinaryURL";

type FlowProps = {
  masterId?: string;
  panoramaList: PanoramaItem[];
  hotspotNavigations: HotspotNavigation[];
};

const nodeTypes = {
  customItem: TrackingSpaceItem,
};

const TrackingSpace: React.FC<FlowProps> = ({
  masterId,
  panoramaList,
  hotspotNavigations,
}) => {
  //============== REDUX ===============

  const defaultInSpace = React.useMemo(() => {
    return panoramaList.find((h) => h.id == masterId);
  }, [panoramaList]);

  const panoramaListExceptMasterNode = React.useMemo(() => {
    return panoramaList.filter((h) => h.id !== defaultInSpace?.id);
  }, [panoramaList, defaultInSpace]);

  //============== REDUX ===============

  /**
   * Method tính toán số lượng ảnh trong 1 tour.
   */

  const numOfPanosInMaster = (nodeId: string): number => {
    const panoIdSet = new Set(panoramaList.map((p) => p.id));

    const hotspots = hotspotNavigations.filter(
      (h) => h.nodeId === nodeId && !panoIdSet.has(h.targetNodeId)
    );
    return hotspots.length + 1;
  };

  /**
   * Method tính toán số lượng hotspot tới 1 panoramalist
   *
   */

  const nodes = React.useMemo(() => {
    if (!defaultInSpace) return [];
    return [
      {
        id: defaultInSpace.id,
        type: "customItem",
        position: { x: 0, y: 54 },
        data: {
          id: defaultInSpace.id,
          name: defaultInSpace.config.name,
          img: transformUrlToThumbnail(defaultInSpace.url),
          numOfNodes: numOfPanosInMaster(defaultInSpace.id),
          root: true,
        },
      },
      ...panoramaListExceptMasterNode.map((item, index) => ({
        id: item.id,
        type: "customItem",
        position: { x: 500, y: index * 100 },
        data: {
          id: item.id,
          name: item.config.name,
          img: transformUrlToThumbnail(item.url),
          numOfNodes: numOfPanosInMaster(item.id),
          root: false,
        },
      })),
    ];
  }, [defaultInSpace, panoramaListExceptMasterNode]);

  const edges = React.useMemo(() => {
    const result: any[] = [];
    const handledPairs = new Set<string>();
    const defaultId = defaultInSpace?.id;

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
          label: `[${item.id}] & [${reverseHotspot.id}]`,
          labelStyle: {
            fill: "#000",
            fontSize: 6,
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
          label: `[${item.id}]`,
          labelStyle: {
            fill: "#000",
            fontSize: 8,
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
        edges={hotspotNavigations.length > 0 ? edges : []}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView={true}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <div className={styles.tracking_notes}>
        <span className={styles.note_title}>Chú thích</span>
        <div className={styles.note_content}>
          <div className={styles.note_line}>
            <div className={styles.line_preview_two}></div> : Đã liên kết 2
            chiều.
          </div>
          <div className={styles.note_line}>
            <div className={styles.line_preview_one}></div> : Liên kết 1 chiều.
          </div>
        </div>
      </div>
    </div>
  );
};
export default TrackingSpace;
