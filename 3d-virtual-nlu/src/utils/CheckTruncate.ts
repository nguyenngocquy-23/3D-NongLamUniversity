export const isFieldCodeUnique = (
  fields: { code: string }[],
  codeToCheck: string
): 0 | 1 => {
  const exists = fields.some((field) => field.code === codeToCheck);
  return exists ? 0 : 1;
};
