export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeForDisplay(input: string): string {
  // For displaying user content safely
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
