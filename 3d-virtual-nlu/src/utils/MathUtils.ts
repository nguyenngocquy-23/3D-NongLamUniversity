/**
 * Mặc định, trong Redux mỗi ảnh sẽ có position của camera riêng.
 * => Để hiển thị đúng của mỗi ảnh lên thanh điều chỉnh hướng mặc định thì:
 * + Ta cần chuyển vị trí toạ độ x,z về thành góc bao nhiêu độ.
 *          |
 *          |
 *       (-180/ 180)
 *          |
 * --(-90)-------(90)-------> (x)
 *          |
 *          * (0) (vị trí camera mặc định hướng về tâm, được coi là 0 độ)
 *          |
 *          |
 *          v  (z)
 * + Góc angle mặc định là 0 độ.
 * +++ originalZ: vị trí ban đầu của z, camera sẽ xoay quanh tâm vòng tròn có bán kính là originalZ.
 * +++ positionX = bán kính * sin(góc Angle)
 * +++ positionZ = bán kính * cos(góc Angle)
 * =>> Ta cần truy ngược lại angle từ positionX,Z.
 *
 * sin(góc Angle) = posX/bán kính (X)
 * cos(góc Angle) = posZ/bán kính (Z)
 *
 *
 * sin(góc Angle) / cos(góc Angle) = tan (góc Angle) = X/Z
 *                               <==> góc Angle = atan2(X,Z)
 * Note : atan2 sử dụng để xác định góc phần tư của Z,X. trong khi atan có thể bị nhầm trường hợp nếu z âm x dương hoặc z dương x âm.
 */

export const getAngleFromXZ = (x: number, z: number): number => {
  const radians = Math.atan2(x, z);
  let degrees = (radians * 180) / Math.PI;
  if (degrees < 0) degrees += 360; // giá trị radian có thể âm.
  return degrees;
};
/**
 *
 * @param angle : Góc được trả về từ Redux. Ở mặc định, là vị trí 0 độ.
 *
 * angle : 0 độ - 360 độ
 * Ở mặc định angle là 0 độ / vFov là 100.
 * => start/end thực tế là: 310 --> 50.
 * ----------------------------------------------
 * angle | start/end Three | start/end radar
 * ----------------------------------------------
 * 0     | 310 --> 50        |  220 --> 320       | 270
 * 90    | 20  --> 120 (+90) |  130 --> 230 (-90) | 180
 * 180   | 130 --> 230 (+180)|  40  --> 140 (-180)| 90
 * 270   | 220 --> 320 (+270)|  310 --> 50 (-270) | 0
 * initialAngle: 0.
 * initialRadar: 270
 */
export function getArcAnglesThree(
  initialAngle: number,
  initialRadar: number,
  angle: number,
  vFov: number
) {
  const operator = -(angle - initialAngle);
  const angleRadar = initialRadar + operator;

  // Chuyển góc sang hệ SVG theo quy luật trừ 90 độ
  const startSvg = (angleRadar - vFov / 2 + 360) % 360;
  const endSvg = (startSvg + vFov) % 360;

  return { startSvg, endSvg };
}

/**
 * Tính toán khoảng giá trị (min, max) cho một trục (x, y hoặc z)
 * sao cho điểm vẫn nằm trên mặt cầu với tâm tại (0,0,0).
 *
 * Dựa trên phương trình tổng quát của hình cầu:
 * x^2 + y^2 + z^2 = R^2.
 * => Mô hình 3D (T) khiến ta phải cộng thêm 1 lượng Tx, Ty, Tz ) nữa cho từng cái x,y,z.
 * => Giới hạn để tránh toạ độ thoát ra hình cầu bây giờ phải là:
 * (x + Tx)^2 + (y + Ty)^2 + (z+ Tz)^2 <= 100^2 (R =100)
 * Ví dụ: Giới hạn vị trí của x
 * (x+ Tx) <= Căn bậc 2 của (100^2 - (y+Ty)^2 - (z+Tz)^2)
 *
 * @param currentPosition - Tọa độ hiện tại của điểm [x, y, z]
 * @param axis - Trục cần tính ('x' | 'y' | 'z')
 * @returns [min, max] giới hạn của trục đó
 */
export function getAxisRange(
  currentPosition: [number, number, number],
  axis: "x" | "y" | "z",
  fixed: number
): [number, number] {
  const [x, y, z] = currentPosition;
  const R = 100; // Bán kính hình cầu

  let fixed1: number, fixed2: number;

  // Chọn các trục cố định dựa trên axis
  switch (axis) {
    case "x":
      fixed1 = y;
      fixed2 = z;
      break;
    case "y":
      fixed1 = x;
      fixed2 = z;
      break;
    case "z":
      fixed1 = x;
      fixed2 = y;
      break;
  }

  // Tính khoảng giới hạn cho trục được chọn
  const discriminant = R * R - (fixed1 + fixed) ** 2 - (fixed2 + fixed) ** 2;
  if (discriminant < 0) {
    // Nếu discriminant âm, không có giá trị hợp lệ
    return [0, 0];
  }

  const max = Math.sqrt(discriminant) - fixed;
  const min = -Math.sqrt(discriminant) - fixed;

  return [min, max];
}

export function limitNewPostionFor3D(
  currentPosition: [number, number, number]
): { x: number; y: number; z: number } {
  const [x, y, z] = currentPosition;

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  return {
    x: clamp(x, -100, 100),
    y: clamp(y, -100, 100),
    z: clamp(z, -100, 100),
  };
}
