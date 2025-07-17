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
export const initialRgba: rgbaColor = {
  r: 255,
  g: 255,
  b: 255,
  a: 1,
};

export function stringToRgba(color: string): rgbaColor | null {
  const regex =
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d*\.?\d+)\s*\)/;

  const match = color.match(regex);

  if (!match) return null;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: parseInt(match[4]),
  };
}
