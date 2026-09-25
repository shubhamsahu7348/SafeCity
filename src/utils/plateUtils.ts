/**
 * Formats a given license plate string into the standard 'AA 00 AA 0000' format.
 * Examples:
 *  "MH12TR8899" -> "MH 12 TR 8899"
 *  "mh-12-ab-1234" -> "MH 12 AB 1234"
 *  "DL01CA5678" -> "DL 01 CA 5678"
 */
export function formatLicensePlate(val: string): string {
  if (!val) return '';
  const upper = val.trim().toUpperCase();
  if (upper.includes('CCTV') || upper.includes('VERIFY') || upper.includes('PENDING') || upper.includes('INVESTIGATE')) {
    return upper;
  }
  // Convert to uppercase and strip invalid characters
  const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length === 0) return '';

  const p1 = clean.substring(0, 2);
  const p2 = clean.substring(2, 4);
  const p3 = clean.substring(4, 6);
  const p4 = clean.substring(6, 10);

  let formatted = p1;
  if (p2) formatted += ' ' + p2;
  if (p3) formatted += ' ' + p3;
  if (p4) formatted += ' ' + p4;

  return formatted;
}
