export const DEFAULT_ORIGINAL_Z = 0.0000001;
export const RADIUS_SPHERE = 100;
export const RADIUS_MINIMAP_TOUR = 35;
export const DEFAULT_ZOOM_ANGLE = 75;
export const DEFAULT_ANGLE_THREE = 0;
export const DEFAULT_ANGLE_RADAR = 270;
export const MAX_QUANTITY_PANORAMA = 5; //Số lượng tối đa trong 1 tour.

//Xử lý lưu ảnh trong Cloudinary.
export const PICTURE_SIZE_LIMIT = 2; //Kích thước tối đa cho hình tải lên Info.
export const PICTURE_MAX_WIDTH = 500; //Kích thước tối đa ảnh
export const PICTURE_MAX_HEIGHT = 500; //Kích thước tối đa ảnh
export const PICTURE_MAX_QUANTITY = 2; //Kích thước tối đa ảnh

export const AROUND_MAP = 0.04;
export const perPage = 10;

export const MAX_DESCRIPTION = 300; //kích thước mô tả tối đa

const statusMap: Record<number, string> = {
  0: "Tạm ngưng",
  1: "Hoạt động",
  2: "Hoạt động",
  3: "Chờ duyệt",
};

export const getStatusText = (status: number): string => {
  return statusMap[status] ?? "Không xác định";
};
