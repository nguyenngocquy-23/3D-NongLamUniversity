import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../Store";
import { HotspotNavigation } from "./HotspotSlice";

const selectHotspotList = (state: RootState) => state.hotspots.hotspotList;
const panoramaList = (state: RootState) => state.panoramas.panoramaList;
const masterNode = (state: RootState) =>
  state.panoramas.panoramaList.find((p) => p.config.status === 2);

/**
 * Lấy ra danh sách hospot navigation có targetNodeId..
 */

export const getFilteredHotspotNavigations = createSelector(
  [selectHotspotList],
  (hotspotList): HotspotNavigation[] => {
    return hotspotList.filter(
      (h): h is HotspotNavigation =>
        h.type === 1 && !!(h as HotspotNavigation).targetNodeId
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
    return list.filter((h) => h.nodeId === node.id);
  }
);

/**
 * Lấy ra danh sách hotspot navigation của 1 node bất kỳ.
 */
export const getFilteredHotspotNavigationById = (nodeId: string) =>
  createSelector([getFilteredHotspotNavigations], (list) =>
    list.filter((h) => h.nodeId === nodeId || h.targetNodeId === nodeId)
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
  hotsotId: string
) => {
  return createSelector(
    [selectHotspotList, panoramaList],
    (hotspots, panoramas) => {
      const hotspot = hotspots.find((h) => h.id === hotsotId);
      if (!hotspot) return undefined;
      const panorama = panoramas.find((p) => p.id === hotspot.nodeId);
      if (!panorama) return undefined;
      return getFilteredListPanoramaByStatus(panorama.config.status).resultFunc(
        panoramas
      );
    }
  );
};
