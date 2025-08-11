export function safeParseJsonArray(json: string): number[] {
  try {
    const result = JSON.parse(json);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}
