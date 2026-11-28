import { defaultSettings } from "./constants";
import type { Settings } from "./types";

/** Reads the settings from their cookie; a malformed cookie reads as the defaults. */
export function readSettings(value: string | undefined): Settings {
  if (!value || value.length > 1000) return defaultSettings;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== "object") return defaultSettings;
    const record = data as Record<string, unknown>;
    if (
      typeof record.name !== "string" ||
      !record.name.trim() ||
      record.name.length > 60 ||
      (record.bridge !== "lxdbr0" && record.bridge !== "ovn-1") ||
      typeof record.ipv6 !== "boolean" ||
      typeof record.snapshots !== "boolean" ||
      typeof record.maxInstances !== "string" ||
      !isValidMaximum(record.maxInstances)
    )
      return defaultSettings;
    return {
      name: record.name,
      bridge: record.bridge,
      ipv6: record.ipv6,
      snapshots: record.snapshots,
      maxInstances: record.maxInstances,
    };
  } catch {
    return defaultSettings;
  }
}
/** Whether `value` is a whole number from 1 to 100. */
export function isValidMaximum(value: string): boolean {
  return /^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 100;
}
/** The posted maximum as the number field's value: `null` when empty or not a number, so the field shows it empty. */
export function readMaximum(value: string): number | null {
  const maximum = value.trim() === "" ? Number.NaN : Number(value);
  return Number.isFinite(maximum) ? maximum : null;
}
