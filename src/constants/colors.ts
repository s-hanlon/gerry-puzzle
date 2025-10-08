// src/constants/colors.ts
export const DISTRICT_COLORS: number[] = [
  0x00c853, // 1
  0xffab00, // 2
  0x7c4dff, // 3
  0xff5252, // 4
  0x40c4ff, // 5
  0xb388ff, // 6
  0x8bc34a, // 7
];

// helpers
export function colorNumToHex(n: number): string {
  return `#${n.toString(16).padStart(6, '0')}`;
}
export function colorNumToRgba(n: number, alpha = 1): string {
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
