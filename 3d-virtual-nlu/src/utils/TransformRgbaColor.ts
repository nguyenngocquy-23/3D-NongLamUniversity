export type rgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};
export function rgbaToString(color: rgbaColor): string {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
