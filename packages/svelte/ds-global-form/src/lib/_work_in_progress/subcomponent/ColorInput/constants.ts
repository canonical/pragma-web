import type { HexFormat } from "./types.js";

export const HEX_PATTERNS: Record<HexFormat, RegExp> = {
  hex3: /^#[0-9a-fA-F]{3}$/,
  hex6: /^#[0-9a-fA-F]{6}$/,
  hex8: /^#[0-9a-fA-F]{8}$/,
};

export const HEX_MAX_LENGTHS: Record<HexFormat, number> = {
  hex3: 3,
  hex6: 6,
  hex8: 8,
};

export const DEFAULT_SWATCHES: readonly string[] = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

export const DEFAULT_HEX_FORMATS: readonly HexFormat[] = ["hex6"];
