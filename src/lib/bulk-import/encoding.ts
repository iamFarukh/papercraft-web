/**
 * Repair UTF-8 text that was mis-read as Latin-1 / Windows-1252 (common CSV issue).
 * Example: "संजीव" → "à¤¸à¤‚à¤œà¥€à¤µ"
 */
export function repairUtf8Mojibake(text: string): string {
  if (!text) return text
  // Typical mojibake from Devanagari UTF-8 read as Latin-1
  if (!/[àâäæçéèêëïîôùûüÿ¤]/.test(text)) return text

  try {
    const bytes = Uint8Array.from(text, (c) => c.charCodeAt(0) & 0xff)
    const repaired = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    // Only accept if we actually got Indic or other non-mojibake script
    if (repaired !== text && !/[àâäæçéèêëïîôùûüÿ¤]/.test(repaired)) {
      return repaired
    }
  } catch {
    // not mojibake
  }
  return text
}

/** Decode uploaded CSV bytes as UTF-8 (with optional BOM strip). */
export function decodeCsvBytes(bytes: Uint8Array): string {
  let start = 0
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    start = 3
  }
  return new TextDecoder('utf-8').decode(bytes.subarray(start))
}

export function normalizeImportText(text: string): string {
  return repairUtf8Mojibake(text.trim())
}
