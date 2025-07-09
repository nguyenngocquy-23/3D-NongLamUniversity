import React, { createContext, useContext, useRef } from "react";
import { ImageQuality } from "../utils/getCloudinaryURL";

export type ImageCacheEntry = {
  img: HTMLImageElement;
  objectUrl: string;
  quality: ImageQuality;
  lastUsed: number; //time to live
};

/**
 * string: id của node hiện tại
 */
export type ImageCacheMap = Record<string, ImageCacheEntry>;

type ImageCacheRef = React.MutableRefObject<ImageCacheMap>;

const ImageCacheContext = createContext<ImageCacheRef | null>(null);

export const ImageCacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const imageRef = useRef<ImageCacheMap>({});
  return (
    <ImageCacheContext.Provider value={imageRef}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = () => {
  const context = useContext(ImageCacheContext);
  if (!context)
    throw new Error(
      "useImageCache phải được sử dụng trong 1 ImageCacheProvider"
    );

  return context;
};
