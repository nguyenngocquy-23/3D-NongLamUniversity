// utils/dateUtils.ts

export function formatTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`; // hoặc `${year}-${month}-${day}` nếu bạn thích
  }
  