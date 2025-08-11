import { useDeviceInfo } from "../contexts/DeviceInfoContext";

export type ImageQuality = "2K" | "4K" | "8K";

export const useMaxImageQuality = (): ImageQuality => {
  const { pixelRatio, isMobile, ram, cpuCores } = useDeviceInfo();
  if (isMobile) return "2K";
  else if (ram >= 8 && cpuCores >= 8 && pixelRatio >= 1.5) return "8K";
  else return "4K";
};

/**
 * Xác định url sẽ lấy dành cho High Quality cho 1 ảnh.
 * @param baseUrl : Url gốc trên Cloudinary
 * @param quality : Chất lượng ảnh, xác định nhờ hàm useMaxImageQuality.
 * @returns Đường dẫn url sẽ gọi tới Cloudinary.
 */
export const buildImageUrlWithQuality = (
  baseUrl: string,
  quality: ImageQuality
): string => {
  if (quality === "8K") return baseUrl;

  const dimension = {
    "2K": { w: 2048, h: 1024 },
    "4K": { w: 4096, h: 2048 },
  }[quality];

  return baseUrl.replace(
    "/upload",
    `/upload/w_${dimension.w}/h_${dimension.h}/c_fill/q_auto/f_auto`
  );
};

/**
 * Transform để sử dụng cho thumbnails.
 */
export const transformUrlToThumbnail = (baseUrl: string): string => {
  return baseUrl.replace("/upload", `/upload/w_320/q_20/f_auto`);
};

export const transformUrlToThumbnailBig = (baseUrl: string): string => {
  return baseUrl.replace("/upload", `/upload/w_480/q_70/f_auto`);
};
