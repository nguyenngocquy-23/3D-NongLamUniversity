export const formatDateTime = (value: string): string => {
    // Chia chuỗi thành ngày và giờ

    const year = value[0].toString();
    const month = value[1].toString();
    const day = value[2].toString();

    const hour = value[3].toString();
    const minute = value[4].toString();
    const second = value[5].toString();
    
    // Trả về định dạng mong muốn
    return `${day.length == 1 ? '0'+day: day}/${month.length == 1 ? '0'+month : month}/${year}`;
  };