import {
  NodeResponse,
  NodeExpandResponse,
  NodeUpdateRequest,
  isInteger,
  HotspotNavResponse,
  HotspotNavUpdateRequest,
  HotspotInfoResponse,
  HotspotInfoUpdateRequest,
  HotspotMediaResponse,
  HotspotMediaUpdateRequest,
  HotspotModelResponse,
  HotspotModelUpdateRequest,
} from "./TourNodeRequestMapper";

interface DiffResult<T> {
  toCreate: T[];
  toUpdate: T[];
  toDelete: string[];
}

export function diffNode(
  original: NodeResponse[] | NodeExpandResponse[],
  updated: NodeUpdateRequest[]
): DiffResult<NodeUpdateRequest> {
  const updatedIds = new Set(updated.map((u) => u.id));
  const originalMap = new Map(original.map((o) => [String(o.id), o]));

  const toDelete = original
    .filter((o) => !updatedIds.has(String(o.id)))
    .map((o) => String(o.id));

  const deletedIdSet = new Set(toDelete);

  const toUpdate = updated.filter((u) => {
    if (!isInteger(u.id) || deletedIdSet.has(u.id)) return false;

    const o = originalMap.get(u.id);
    if (!o) return false;

    const nodeChanged = isPrimitiveNodeFieldChanged(o, u);

    const navDiff = diffHotspotNav(o.navHotspots ?? [], u.navHotspots ?? []);
    const infoDiff = diffHotspotInfos(
      o.infoHotspots ?? [],
      u.infoHotspots ?? []
    );
    const mediaDiff = diffHotspotMedia(
      o.mediaHotspots ?? [],
      u.mediaHotspots ?? []
    );
    const modelDiff = diffHotspotModel(
      o.modelHotspots ?? [],
      u.modelHotspots ?? []
    );

    const hasHotspotChanged =
      navDiff.toCreate.length > 0 ||
      navDiff.toUpdate.length > 0 ||
      navDiff.toDelete.length > 0 ||
      infoDiff.toCreate.length > 0 ||
      infoDiff.toUpdate.length > 0 ||
      infoDiff.toDelete.length > 0 ||
      mediaDiff.toCreate.length > 0 ||
      mediaDiff.toUpdate.length > 0 ||
      mediaDiff.toDelete.length > 0 ||
      modelDiff.toCreate.length > 0 ||
      modelDiff.toUpdate.length > 0 ||
      modelDiff.toDelete.length > 0;

    return nodeChanged || hasHotspotChanged;
  });

  return {
    toCreate: [],
    toUpdate,
    toDelete,
  };
}

export function diffHotspotNav(
  original: HotspotNavResponse[],
  updated: HotspotNavUpdateRequest[]
): DiffResult<HotspotNavUpdateRequest> {
  //Tập hợp duy nhất của id trong updated.
  const updatedIds = new Set(updated.map((u) => u.id));
  const updatedMap = new Map(updated.map((u) => [String(u.id), u]));

  const toDelete = original
    .filter((o) => !updatedIds.has(o.id))
    .map((o) => o.id);

  const deletedIdSet = new Set(toDelete);

  // B2. Những node có id là số nguyên và không nằm trong danh sách bị xoá => là dạng sơ cấp của toUpdate
  const toUpdate: HotspotNavUpdateRequest[] = [];

  for (const o of original) {
    const u = updatedMap.get(o.id);
    if (u && isInteger(u.id) && !deletedIdSet.has(u.id)) {
      if (isPrimitiveNavFieldChange(o, u)) {
        toUpdate.push(u);
      }
    }
  }
  /**
   * Logic tạo: Id panos là dạng chữ nanoId => Tạo mới
   */
  const toCreate = updated.filter((u) => !isInteger(u.id));

  return {
    toCreate,
    toUpdate,
    toDelete,
  };
}

export function diffHotspotInfos(
  original: HotspotInfoResponse[],
  updated: HotspotInfoUpdateRequest[]
): DiffResult<HotspotInfoUpdateRequest> {
  //Tập hợp duy nhất của id trong updated.
  const updatedIds = new Set(updated.map((u) => u.id));
  const updatedMap = new Map(updated.map((u) => [String(u.id), u]));

  const toDelete = original
    .filter((o) => !updatedIds.has(o.id))
    .map((o) => o.id);

  const deletedIdSet = new Set(toDelete);

  // B2. Những node có id là số nguyên và không nằm trong danh sách bị xoá => là dạng sơ cấp của toUpdate
  const toUpdate: HotspotInfoUpdateRequest[] = [];

  for (const o of original) {
    const u = updatedMap.get(o.id);
    if (u && isInteger(u.id) && !deletedIdSet.has(u.id)) {
      if (isPrimitiveInfosFieldChange(o, u)) {
        toUpdate.push(u);
      }
    }
  }
  /**
   * Logic tạo: Id panos là dạng chữ nanoId => Tạo mới
   */
  const toCreate = updated.filter((u) => !isInteger(u.id));

  return {
    toCreate,
    toUpdate,
    toDelete,
  };
}
export function diffHotspotMedia(
  original: HotspotMediaResponse[],
  updated: HotspotMediaUpdateRequest[]
): DiffResult<HotspotMediaUpdateRequest> {
  //Tập hợp duy nhất của id trong updated.
  const updatedIds = new Set(updated.map((u) => u.id));
  const updatedMap = new Map(updated.map((u) => [String(u.id), u]));

  const toDelete = original
    .filter((o) => !updatedIds.has(o.id))
    .map((o) => o.id);

  const deletedIdSet = new Set(toDelete);

  // B2. Những node có id là số nguyên và không nằm trong danh sách bị xoá => là dạng sơ cấp của toUpdate
  const toUpdate: HotspotMediaUpdateRequest[] = [];

  for (const o of original) {
    const u = updatedMap.get(o.id);
    if (u && isInteger(u.id) && !deletedIdSet.has(u.id)) {
      if (isPrimitiveMediaFieldChange(o, u)) {
        toUpdate.push(u);
      }
    }
  }
  /**
   * Logic tạo: Id panos là dạng chữ nanoId => Tạo mới
   */
  const toCreate = updated.filter((u) => !isInteger(u.id));

  return {
    toCreate,
    toUpdate,
    toDelete,
  };
}

export function diffHotspotModel(
  original: HotspotModelResponse[],
  updated: HotspotModelUpdateRequest[]
): DiffResult<HotspotModelUpdateRequest> {
  //Tập hợp duy nhất của id trong updated.
  const updatedIds = new Set(updated.map((u) => u.id));
  const updatedMap = new Map(updated.map((u) => [String(u.id), u]));

  const toDelete = original
    .filter((o) => !updatedIds.has(o.id))
    .map((o) => o.id);

  const deletedIdSet = new Set(toDelete);

  // B2. Những node có id là số nguyên và không nằm trong danh sách bị xoá => là dạng sơ cấp của toUpdate
  const toUpdate: HotspotModelUpdateRequest[] = [];

  for (const o of original) {
    const u = updatedMap.get(o.id);
    if (u && isInteger(u.id) && !deletedIdSet.has(u.id)) {
      if (isPrimitiveModelFieldChange(o, u)) {
        toUpdate.push(u);
      }
    }
  }

  /**
   * Logic tạo: Id panos là dạng chữ nanoId => Tạo mới
   */
  const toCreate = updated.filter((u) => !isInteger(u.id));

  return {
    toCreate,
    toUpdate,
    toDelete,
  };
}

function isPrimitiveNodeFieldChanged(
  a: NodeResponse,
  b: NodeUpdateRequest
): boolean {
  return (
    a.url !== b.url ||
    a.name !== b.name ||
    a.description !== b.description ||
    a.positionX !== b.positionX ||
    a.positionY !== b.positionY ||
    a.positionZ !== b.positionZ ||
    a.yawOffset !== b.yawOffset ||
    a.brightness !== b.brightness ||
    a.contrast !== b.contrast ||
    a.saturation !== b.saturation ||
    a.grayscale !== b.grayscale ||
    a.exposure !== b.exposure ||
    a.lightIntensity !== b.lightIntensity ||
    a.status !== b.status
  );
}

function isPrimitiveNavFieldChange(
  a: HotspotNavResponse,
  b: HotspotNavUpdateRequest
): boolean {
  return (
    a.iconId !== b.iconId ||
    a.status !== b.status ||
    a.positionX !== b.positionX ||
    a.positionY !== b.positionY ||
    a.positionZ !== b.positionZ ||
    a.pitchX !== b.pitchX ||
    a.yawY !== b.yawY ||
    a.rollZ !== b.rollZ ||
    a.scale !== b.scale ||
    a.color !== b.color ||
    a.backgroundColor !== b.backgroundColor ||
    a.allowBackgroundColor !== b.allowBackgroundColor ||
    a.opacity !== b.opacity ||
    a.targetNodeId !== b.targetNodeId
  );
}

function isPrimitiveInfosFieldChange(
  a: HotspotInfoResponse,
  b: HotspotInfoUpdateRequest
): boolean {
  return (
    a.iconId !== b.iconId ||
    a.status !== b.status ||
    a.positionX !== b.positionX ||
    a.positionY !== b.positionY ||
    a.positionZ !== b.positionZ ||
    a.pitchX !== b.pitchX ||
    a.yawY !== b.yawY ||
    a.rollZ !== b.rollZ ||
    a.scale !== b.scale ||
    a.color !== b.color ||
    a.backgroundColor !== b.backgroundColor ||
    a.allowBackgroundColor !== b.allowBackgroundColor ||
    a.opacity !== b.opacity ||
    a.content !== b.content ||
    a.backgroundColorContent !== b.backgroundColorContent ||
    a.borderColorContent !== b.borderColorContent ||
    a.borderSizeContent !== b.borderSizeContent
  );
}

function isPrimitiveMediaFieldChange(
  a: HotspotMediaResponse,
  b: HotspotMediaUpdateRequest
): boolean {
  return (
    a.iconId !== b.iconId ||
    a.status !== b.status ||
    a.positionX !== b.positionX ||
    a.positionY !== b.positionY ||
    a.positionZ !== b.positionZ ||
    a.pitchX !== b.pitchX ||
    a.yawY !== b.yawY ||
    a.rollZ !== b.rollZ ||
    a.scale !== b.scale ||
    a.color !== b.color ||
    a.backgroundColor !== b.backgroundColor ||
    a.allowBackgroundColor !== b.allowBackgroundColor ||
    a.opacity !== b.opacity ||
    a.mediaType !== b.mediaType ||
    a.mediaUrl !== b.mediaUrl ||
    a.caption !== b.caption ||
    a.cornerPointList !== b.cornerPointList
  );
}
function isPrimitiveModelFieldChange(
  a: HotspotModelResponse,
  b: HotspotModelUpdateRequest
): boolean {
  return (
    a.iconId !== b.iconId ||
    a.status !== b.status ||
    a.positionX !== b.positionX ||
    a.positionY !== b.positionY ||
    a.positionZ !== b.positionZ ||
    a.pitchX !== b.pitchX ||
    a.yawY !== b.yawY ||
    a.rollZ !== b.rollZ ||
    a.scale !== b.scale ||
    a.color !== b.color ||
    a.backgroundColor !== b.backgroundColor ||
    a.allowBackgroundColor !== b.allowBackgroundColor ||
    a.opacity !== b.opacity ||
    a.modelUrl !== b.modelUrl ||
    a.thumbnailUrl !== b.thumbnailUrl ||
    a.name !== b.name ||
    a.description !== b.description
  );
}
