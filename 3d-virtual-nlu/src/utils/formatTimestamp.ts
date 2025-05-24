// utils/dateUtils.ts

export function formatTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
    const year = date.getFullYear();

    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
  
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`; // hoặc `${year}-${month}-${day}` nếu bạn thích
  }
  