export const hexToBackground = (hex: string | [string, string]): string =>
  Array.isArray(hex)
    ? `linear-gradient(to right, ${hex[0]} 50%, ${hex[1]} 50%)`
    : hex

export const firstHex = (hex: string | [string, string]): string =>
  Array.isArray(hex) ? hex[0] : hex
