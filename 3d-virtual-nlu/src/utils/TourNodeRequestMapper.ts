import {
  HotspotItem,
  HotspotNavigation,
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
} from "../redux/slices/HotspotSlice";
import { PanoramaItem } from "../redux/slices/PanoramaSlice";

/**
 * Định dạng theo BackendAPI.
 */
export interface NodeCreateRequest {
  id: string;
  tempId: string;
  spaceId: string;
  userId: number;
  url: string;
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  autoRotate: number;
  speedRotate: number;
  lightIntensity: number;
  status: number;
  navHotspots: HotspotNavCreateRequest[];
  infoHotspots: HotspotInfoCreateRequest[];
  mediaHotspots: HotspotMediaCreateRequest[];
  modelHotspots: HotspotModelCreateRequest[];
}

export interface NodeResponse {
  id: string;
  spaceId: string;
  fieldId: string;
  userId: string;
  url: string;
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  autoRotate: number;
  speedRotate: number;
  lightIntensity: number;
  status: number;
  navHotspots: HotspotNavResponse[];
  infoHotspots: HotspotInfoResponse[];
  mediaHotspots: HotspotMediaResponse[];
  modelHotspots: HotspotModelResponse[];
}
export interface HotspotNavResponse {
  id: string;
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  targetNodeId: string;
}

export interface HotspotInfoResponse {
  id: string;
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  title: string;
  content: string;
}
export interface HotspotMediaResponse {
  id: string;
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  mediaType: string;
  mediaUrl: string;
  caption: string;
  cornerPointList: string;
}
export interface HotspotModelResponse {
  id: string;
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  modelUrl: string;
  name: string;
  description: string;
  colorCode: string;
}

export interface HotspotNavCreateRequest {
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  targetNodeId: string;
}

export interface HotspotInfoCreateRequest {
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  title: string;
  content: string;
}
export interface HotspotMediaCreateRequest {
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  mediaType: string;
  mediaUrl: string;
  caption: string;
  cornerPointList: string;
}
export interface HotspotModelCreateRequest {
  nodeId: string;
  type: number;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  scale: number;
  modelUrl: string;
  name: string;
  description: string;
  colorCode: string;
}

export class TourNodeRequestMapper {
  static mapOneNodeCreateRequest(
    panoramaList: PanoramaItem[],
    hotspotList: HotspotItem[],
    userId: number
  ): NodeCreateRequest[] {
    return panoramaList.map((pano) => {
      const userJson = sessionStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const nodeIdTemp = pano.id; // id temp của từng pano một
      const hotspotsForNode = hotspotList.filter(
        (h) => h.nodeId === nodeIdTemp
      );

      //List hotspot của từng panorama.
      const navHotspots: HotspotNavCreateRequest[] = hotspotsForNode
        .filter((h): h is HotspotNavigation => h.type === 1)
        .map((h) => ({
          nodeId: h.nodeId, // set lại sau khi lấy được id tự tăng.
          type: h.type,
          iconId: h.iconId,
          positionX: h.positionX,
          positionY: h.positionY,
          positionZ: h.positionZ,
          pitchX: h.pitchX,
          yawY: h.yawY,
          rollZ: h.rollZ,
          color: h.color,
          backgroundColor: h.backgroundColor,
          allowBackgroundColor: h.allowBackgroundColor == false ? 0 : 1,
          opacity: h.opacity,
          scale: h.scale,
          targetNodeId: h.targetNodeId, //
        }));

      const infoHotspots: HotspotInfoCreateRequest[] = hotspotsForNode
        .filter((h): h is HotspotInformation => h.type === 2)
        .map((h) => ({
          nodeId: h.nodeId, // set lại sau khi lấy được id tự tăng.
          type: h.type,
          iconId: h.iconId,
          positionX: h.positionX,
          positionY: h.positionY,
          positionZ: h.positionZ,
          pitchX: h.pitchX,
          yawY: h.yawY,
          rollZ: h.rollZ,
          color: h.color,
          backgroundColor: h.backgroundColor,
          allowBackgroundColor: h.allowBackgroundColor == false ? 0 : 1,
          opacity: h.opacity,
          scale: h.scale,
          title: h.title,
          content: h.content,
        }));

      const mediaHotspots: HotspotMediaCreateRequest[] = hotspotsForNode
        .filter((h): h is HotspotMedia => h.type === 3)
        .map((h) => ({
          nodeId: h.nodeId, // set lại sau khi lấy được id tự tăng.
          iconId: h.iconId,
          type: h.type,
          positionX: h.positionX,
          positionY: h.positionY,
          positionZ: h.positionZ,
          pitchX: h.pitchX,
          yawY: h.yawY,
          rollZ: h.rollZ,
          color: h.color,
          backgroundColor: h.backgroundColor,
          allowBackgroundColor: h.allowBackgroundColor == false ? 0 : 1,
          opacity: h.opacity,
          scale: h.scale,
          mediaType: h.mediaType,
          mediaUrl: h.mediaUrl,
          caption: h.caption,
          cornerPointList: h.cornerPointList,
        }));

      const modelHotspots: HotspotModelCreateRequest[] = hotspotsForNode
        .filter((h): h is HotspotModel => h.type === 4)
        .map((h) => ({
          nodeId: h.nodeId, // set lại sau khi lấy được id tự tăng.
          type: h.type,
          iconId: h.iconId,
          positionX: h.positionX,
          positionY: h.positionY,
          positionZ: h.positionZ,
          pitchX: h.pitchX,
          yawY: h.yawY,
          rollZ: h.rollZ,
          color: h.color,
          backgroundColor: h.backgroundColor,
          allowBackgroundColor: h.allowBackgroundColor == false ? 0 : 1,
          opacity: h.opacity,
          scale: h.scale,
          modelUrl: h.modelUrl,
          name: h.name,
          description: h.description,
          autoRotate: h.autoRotate,
          colorCode: h.colorCode,
        }));

      return {
        id: pano.id,
        tempId: pano.id,
        spaceId: pano.spaceId ?? 0,
        userId,
        url: pano.url,
        name: pano.config.name,
        description: pano.config.description,
        positionX: pano.config.positionX,
        positionY: pano.config.positionY,
        positionZ: pano.config.positionZ,
        autoRotate: pano.config.autoRotate,
        speedRotate: pano.config.speedRotate,
        lightIntensity: pano.config.lightIntensity,
        status: pano.config.status,
        navHotspots,
        infoHotspots,
        mediaHotspots,
        modelHotspots,
      };
    });
  }

  static mapToPanoramaAndHotspots(nodes: NodeResponse[]): {
    panoramaList: PanoramaItem[];
    hotspotList: HotspotItem[];
  } {
    const panoramaList: PanoramaItem[] = [];
    const hotspotList: HotspotItem[] = [];

    const applyHotspotDefaults = (
      hotspot: Partial<HotspotItem>
    ): Partial<HotspotItem> => ({
      color: hotspot.color ?? "#ffffff",
      backgroundColor: hotspot.backgroundColor ?? "#000000",
      allowBackgroundColor: hotspot.allowBackgroundColor ?? undefined,
      opacity: hotspot.opacity ?? 1,
      ...hotspot,
    });

    for (const node of nodes) {
      panoramaList.push({
        id: node.id,
        spaceId: node.spaceId,
        url: node.url,
        config: {
          name: node.name,
          description: node.description,
          positionX: node.positionX,
          positionY: node.positionY,
          positionZ: node.positionZ,
          autoRotate: node.autoRotate,
          speedRotate: node.speedRotate,
          lightIntensity: node.lightIntensity,
          status: node.status,
        },
      });

      // Nav Hotspots
      node.navHotspots?.forEach((h, idx) => {
        hotspotList.push(
          applyHotspotDefaults({
            id: h.id,
            nodeId: h.nodeId,
            type: h.type,
            iconId: h.iconId,
            positionX: h.positionX,
            positionY: h.positionY,
            positionZ: h.positionZ,
            pitchX: h.pitchX,
            yawY: h.yawY,
            rollZ: h.rollZ,
            scale: h.scale,
            targetNodeId: h.targetNodeId,
          }) as HotspotItem
        );
      });

      // Info Hotspots
      node.infoHotspots?.forEach((h, idx) => {
        hotspotList.push(
          applyHotspotDefaults({
            id: h.id,
            nodeId: h.nodeId,
            type: h.type,
            iconId: h.iconId,
            positionX: h.positionX,
            positionY: h.positionY,
            positionZ: h.positionZ,
            pitchX: h.pitchX,
            yawY: h.yawY,
            rollZ: h.rollZ,
            scale: h.scale,
            title: h.title,
            content: h.content,
          }) as HotspotItem
        );
      });

      // Media Hotspots
      node.mediaHotspots?.forEach((h, idx) => {
        hotspotList.push(
          applyHotspotDefaults({
            id: h.id,
            nodeId: h.nodeId,
            type: h.type,
            iconId: h.iconId,
            positionX: h.positionX,
            positionY: h.positionY,
            positionZ: h.positionZ,
            pitchX: h.pitchX,
            yawY: h.yawY,
            rollZ: h.rollZ,
            scale: h.scale,
            mediaType: h.mediaType,
            mediaUrl: h.mediaUrl,
            caption: h.caption,
            cornerPointList: h.cornerPointList,
          }) as HotspotItem
        );
      });

      // Model Hotspots
      node.modelHotspots?.forEach((h, idx) => {
        hotspotList.push(
          applyHotspotDefaults({
            id: h.id,
            nodeId: h.nodeId,
            type: h.type,
            iconId: h.iconId,
            positionX: h.positionX,
            positionY: h.positionY,
            positionZ: h.positionZ,
            pitchX: h.pitchX,
            yawY: h.yawY,
            rollZ: h.rollZ,
            scale: h.scale,
            modelUrl: h.modelUrl,
            name: h.name,
            description: h.description,
            colorCode: h.colorCode,
          }) as HotspotItem
        );
      });
    }

    return { panoramaList, hotspotList };
  }
}
