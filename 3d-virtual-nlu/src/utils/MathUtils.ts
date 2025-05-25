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
