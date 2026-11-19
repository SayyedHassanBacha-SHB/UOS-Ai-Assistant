export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

export function removeExcessiveWhitespace(text: string): string {
  return text
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeMarkdown(text: string): string {
  return text
    .replace(/[\u00A0\u200B\uFEFF]/g, " ")
    .replace(/[ \t]+/g, " ");
}

export function cleanText(text: string): string {
  return removeExcessiveWhitespace(
    normalizeMarkdown(
      normalizeLineEndings(text)
    )
  );
}