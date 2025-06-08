export const formatDateTime = (value: string): string => {
  // Chia chuỗi thành ngày và giờ

  const year = value[0].toString();
  const month = value[1].toString();
  const day = value[2].toString();

  const hour = value[3].toString();
  const minute = value[4].toString();
  const second = value[5].toString();

  // Trả về định dạng mong muốn
  return `${day.length == 1 ? "0" + day : day}/${
    month.length == 1 ? "0" + month : month
  }/${year}`;
};

export function formatTimeAgo(updatedAt: number | Date): string {
  const now = new Date();
  const past = typeof updatedAt === "number" ? new Date(updatedAt) : updatedAt;

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (diffInSeconds < 60) {
    return "Bây giờ";
  } else if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (hours < 24) {
    return `${hours} giờ trước`;
  } else if (days < 7) {
    return `${days} ngày trước`;
  } else if (days < 30) {
    return `${weeks} tuần trước`;
  } else if (days < 365) {
    return `${months} tháng trước`;
  } else {
    return `${years} năm trước`;
  }
}
