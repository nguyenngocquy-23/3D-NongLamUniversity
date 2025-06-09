export const isFieldCodeUnique = (
  fields: { code: string }[],
  codeToCheck: string
): 0 | 1 => {
  const exists = fields.some((field) => field.code === codeToCheck);
  return exists ? 0 : 1;
};

type NameValidationResult = { valid: true } | { valid: false; error: string };

export function validateName(name: unknown): NameValidationResult {
  if (typeof name !== "string") {
    return { valid: false, error: "Tên phải là chuỗi." };
  }

  const trimmed = name.trim();

  if (trimmed === "") {
    return { valid: false, error: "Tên không được để trống." };
  }

  if (trimmed.toLowerCase() === "null") {
    return { valid: false, error: 'Tên không hợp lệ: không được là "null".' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: "Tên quá ngắn. Tối thiểu 2 ký tự." };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: "Tên quá dài. Tối đa 50 ký tự." };
  }

  if (/\s{2,}/.test(trimmed)) {
    return {
      valid: false,
      error: "Tên không được chứa nhiều khoảng trắng liên tiếp.",
    };
  }

  if (!/^[A-Za-zÀ-Ỹà-ỹ\s]+$/.test(trimmed)) {
    return {
      valid: false,
      error: "Tên chỉ được chứa chữ cái và khoảng trắng.",
    };
  }

  return { valid: true };
}
