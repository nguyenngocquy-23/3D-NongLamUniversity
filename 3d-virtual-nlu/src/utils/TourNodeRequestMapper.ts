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

/**
 * Định dạng theo BackendAPI.
 */
export interface NodeUpdateRequest {
  id: number;
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

/**
 * Dành cho việc liên kết các ảnh master với nhau trong space.
 * 1. Thay đổi hướng mặc định của node.
 * 2. Thêm các hotspot navigation di chuyển giữa các node.
 */
export interface NodeLinkRequest {
  id: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  navHotspots: HotspotNavCreateRequest[];
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
  color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
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
  color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
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
  color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
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
  color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
  modelUrl: string;
  name: string;
  description: string;
  colorCode: string;
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
  color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
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
  color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
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
  color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
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
 color: string;
  backgroundColor: string;
  allowBackgroundColor: number;
  opacity: number;
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
  
  static mapOneNodeUpdateRequest(
    panoramaList: PanoramaItem[],
    hotspotList: HotspotItem[],
  ): NodeUpdateRequest[] {
    return panoramaList.map((pano) => {
      const nodeIdTemp = pano.id; // id temp của từng pano 
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
        id: Number.parseInt(pano.id, 10),
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

  static mapOneNodeLinkRequest(
    panoramaList: PanoramaItem[],
    hotspotList: HotspotNavigation[]
  ): NodeLinkRequest[] {
    return panoramaList.map((pano) => {
      const hotspotOfNode = hotspotList.filter((h) => h.nodeId === pano.id);
      // Lọc ra hotspot có id dạng temp nano
      const navHotspots: HotspotNavCreateRequest[] = hotspotOfNode
        .filter((h) => !isInteger(h.id))
        .map((h) => ({
          nodeId: h.nodeId,
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
          targetNodeId: h.targetNodeId,
        }));
      return {
        id: pano.id,
        positionX: pano.config.positionX,
        positionY: pano.config.positionY,
        positionZ: pano.config.positionZ,
        navHotspots: navHotspots,
      };
    });
  }

  static mapToPanoramaAndHotspots(nodes: NodeResponse[]): {
    panoramaList: PanoramaItem[];
    hotspotList: HotspotItem[];
  } {
    const panoramaList: PanoramaItem[] = [];
    const hotspotList: HotspotItem[] = [];


    for (const node of nodes) {
      panoramaList.push({
        id: String(node.id),
        spaceId: String(node.spaceId),
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
        hotspotList.push({
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
            color: h.color,
            backgroundColor: h.backgroundColor,
            allowBackgroundColor: h.allowBackgroundColor == 0 ? false : true,
            opacity: h.opacity,
            scale: h.scale,
            targetNodeId: h.targetNodeId,
          } as HotspotNavigation
        );
      });

      // Info Hotspots
      node.infoHotspots?.forEach((h, idx) => {
        console.log("Applying defaults to hotspot:", h);
        hotspotList.push({
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
            color: h.color,
            backgroundColor: h.backgroundColor,
            allowBackgroundColor: h.allowBackgroundColor == 0 ? false : true,
            opacity: h.opacity,
            title: h.title,
            content: h.content,
          } as HotspotInformation
        );
      });

      // Media Hotspots
      node.mediaHotspots?.forEach((h, idx) => {
        hotspotList.push({
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
            color: h.color,
            backgroundColor: h.backgroundColor,
            allowBackgroundColor: h.allowBackgroundColor == 0 ? false : true,
            opacity: h.opacity,
            mediaType: h.mediaType,
            mediaUrl: h.mediaUrl,
            caption: h.caption,
            cornerPointList: h.cornerPointList,
          } as HotspotMedia
        );
      });

      // Model Hotspots
      node.modelHotspots?.forEach((h, idx) => {
        hotspotList.push({
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
            color: h.color,
            backgroundColor: h.backgroundColor,
            allowBackgroundColor: h.allowBackgroundColor == 0 ? false : true,
            opacity: h.opacity,
            modelUrl: h.modelUrl,
            name: h.name,
            description: h.description,
            colorCode: h.colorCode,
          } as HotspotModel
        );
      });
    }

    return { panoramaList, hotspotList };
  }
}

/**
 * Ứng dụng cho phần kiểm tra id hotspot trước khi cập nhật liên kết node.
 * @param value : chuỗi dạng số "123"
 * @returns Kiểm tra xem nó có là chuỗi dạng số không
 */
export const isInteger = (value: string): boolean => {
  const parsed = parseInt(value, 10);
  return parsed.toString() === value;
};
