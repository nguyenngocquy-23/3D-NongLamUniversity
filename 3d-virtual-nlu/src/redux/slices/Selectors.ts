import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../Store";
import {
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "./HotspotSlice";

const selectHotspotList = (state: RootState) => state.hotspots.hotspotList;
const spaceList = (state: RootState) => state.data.spaces;
const panoramaList = (state: RootState) => state.panoramas.panoramaList;
const iconList = (state: RootState) => state.data.icons;
const masterNode = (state: RootState) =>
  state.panoramas.panoramaList.find((p) => p.config.status === 2);

/**
 * Lấy ra hotspot theo phân loại
 */

export const getFilteredHotspotNavigationInList = createSelector(
  [selectHotspotList],
  (hotspotList): HotspotNavigation[] => {
    return hotspotList.filter((h): h is HotspotNavigation => h.type === 1);
  }
);
export const getFilteredHotspotInformationInList = createSelector(
  [selectHotspotList],
  (hotspotList): HotspotInformation[] => {
    return hotspotList.filter((h): h is HotspotInformation => h.type === 2);
  }
);
export const getFilteredHotspotMediaInList = createSelector(
  [selectHotspotList],
  (hotspotList): HotspotMedia[] => {
    return hotspotList.filter((h): h is HotspotMedia => h.type === 3);
  }
);
export const getFilteredHotspotModelInList = createSelector(
  [selectHotspotList],
  (hotspotList): HotspotModel[] => {
    return hotspotList.filter((h): h is HotspotModel => h.type === 4);
  }
);

/**
 * Lấy ra danh sách hospot navigation có targetNodeId..
 */

export const getFilteredHotspotNavigations = createSelector(
  [selectHotspotList],
  (hotspotList): HotspotNavigation[] => {
    return hotspotList.filter(
      (h): h is HotspotNavigation =>
        h.type === 1 &&
        h.status !== 0 &&
        !!(h as HotspotNavigation).targetNodeId
    );
  }
);

/**
 * Lấy ra danh sách hotspot navigation của riêng thằng master panorama.
 *
 */

export const getFilteredHotspotNavigationOfMaster = createSelector(
  [getFilteredHotspotNavigations, masterNode],
  (list, node) => {
    if (!node) return [];
    return list.filter((h) => h.nodeId == node.id);
  }
);

/**
 * Lấy ra danh sách hotspot navigation của 1 node bất kỳ.
 */
export const getFilteredHotspotNavigationById = (nodeId: string) =>
  createSelector([getFilteredHotspotNavigations], (list) =>
    list.filter((h) => h.nodeId == nodeId || h.targetNodeId == nodeId)
  );

/**
 * Lấy ra danh sách các node cần được thêm.
 * Master thì cần slave.
 * Slave thì cần master thôi.
 * + Master node có thể là 3 hoặc 2.
 * + Slave thì chỉ có thể là 1.
 */
export const getFilteredListPanoramaByStatus = (status: number) =>
  createSelector([panoramaList], (list) =>
    list.filter((h) =>
      status < 2 ? h.config.status > 1 : h.config.status === 1
    )
  );

/**
 * Tham số là hotspotId.
 * Từ hotspot Id => hotspot => panoramas.
 *
 */

export const getListTargetNodeFromUpdateHotspotNavigation = (
  hotspotId: string
) => {
  return createSelector(
    [selectHotspotList, panoramaList],
    (hotspots, panoramas) => {
      const hotspot = hotspots.find((h) => h.id == hotspotId);
      if (!hotspot) return undefined;
      const panorama = panoramas.find((p) => p.id == hotspot.nodeId);
      if (!panorama) return undefined;
      return getFilteredListPanoramaByStatus(panorama.config.status).resultFunc(
        panoramas
      );
    }
  );
};

/**
 * Lấy ra tất cả số liệu về Field.
 * + Thông tin cơ bản của field.
 * + Số lượng space trên mỗi field.
 *
 */
export const getListSpaceFromFieldId = (fieldId: string) =>
  createSelector([spaceList], (list) =>
    list.filter((l) => l.fieldId === fieldId)
  );

/**
 * Map <string, Set<string>>
 * string: (key) là nodeId
 * Set<string>: (value) là tập hợp targetNodeId nó trỏ tới.
 *
 * Ví dụ:
 * Master A và 2 slaves B,C
 * => Map sẽ có key A và tập 2 con B,C.
 */

export const getHotspotLinkMap = createSelector(
  [getFilteredHotspotNavigations],
  (list) => {
    const map = new Map<string, Set<string>>();
    list.forEach((hotspot) => {
      const { nodeId, targetNodeId } = hotspot;
      if (!map.has(nodeId)) map.set(nodeId, new Set());
      map.get(nodeId)?.add(targetNodeId!); // targetNodeId đã được lọc != null rồi
    });
    return map;
  }
);
