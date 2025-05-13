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
  cornerPointListJson: string;
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
          scale: h.scale,
          mediaType: h.mediaType,
          mediaUrl: h.mediaUrl,
          caption: h.caption,
          cornerPointListJson: "test-nè",
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
}
