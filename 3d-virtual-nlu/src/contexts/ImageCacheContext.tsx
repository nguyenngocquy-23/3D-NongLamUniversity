import React, { createContext, useContext, useRef } from "react";
import { ImageQuality } from "../utils/getCloudinaryURL";
import * as THREE from "three";

export type ImageCacheEntry = {
  img: HTMLImageElement;
  objectUrl: string;
  quality: ImageQuality;
  lastUsed: number; //time to live
};

export type ModelCacheEntry = {
  glbScene: THREE.Group;
  objectUrl: string;
  quality: "high"; //Không cần phân chia.
  lastUsed: number; //time to live
};

/**
 * string: id của node hiện tại
 */
export type ImageCacheMap = Record<string, ImageCacheEntry>;
export type ModelCacheMap = Record<string, ModelCacheEntry>;

export type CacheContextType = {
  imageCacheRef: React.MutableRefObject<ImageCacheMap>;
  modelCacheRef: React.MutableRefObject<ModelCacheMap>;
};

const CacheContext = createContext<CacheContextType | null>(null);

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const imageCacheRef = useRef<ImageCacheMap>({});
  const modelCacheRef = useRef<ModelCacheMap>({});
  return (
    <CacheContext.Provider value={{ imageCacheRef, modelCacheRef }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useImageCache = () => {
  const context = useContext(CacheContext);
  if (!context)
    throw new Error("useImageCache phải được sử dụng trong 1 CacheProvider");

  return context.imageCacheRef;
};
export const useModelCache = () => {
  const context = useContext(CacheContext);
  if (!context)
    throw new Error("useModelCache phải được sử dụng trong 1 CacheProvider");

  return context.modelCacheRef;
};
