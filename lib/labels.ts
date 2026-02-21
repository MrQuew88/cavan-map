/**
 * Generate auto-increment labels: A, B, C, ... Z, AA, AB, ...
 */
export function getNextLabel(existingLabels: string[]): string {
  if (existingLabels.length === 0) return 'A';

  const sorted = existingLabels
    .filter(l => /^[A-Z]+$/.test(l))
    .sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      return a.localeCompare(b);
    });

  if (sorted.length === 0) return 'A';

  const last = sorted[sorted.length - 1];
  return incrementLabel(last);
}

function incrementLabel(label: string): string {
  const chars = label.split('');
  let carry = true;

  for (let i = chars.length - 1; i >= 0 && carry; i--) {
    if (chars[i] === 'Z') {
      chars[i] = 'A';
    } else {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      carry = false;
    }
  }

  if (carry) {
    return 'A' + chars.join('');
  }

  return chars.join('');
}
