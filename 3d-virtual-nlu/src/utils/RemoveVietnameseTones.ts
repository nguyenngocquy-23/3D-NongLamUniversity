export function RemoveVietnameseTones(str: string): string {
  const accents =
    "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
  const noAccents =
    "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

  const map: { [key: string]: string } = {};
  for (let i = 0; i < accents.length; i++) {
    map[accents[i]] = noAccents[i];
  }

  return str
    .split("")
    .map((char) => map[char] || char)
    .join("")
    .toLowerCase();
}
