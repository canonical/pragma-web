export type Settings = { name: string; bridge: string; ipv6: boolean; snapshots: boolean; maxInstances: string };
export const defaults: Settings = { name: "Demo", bridge: "lxdbr0", ipv6: true, snapshots: true, maxInstances: "50" };
// Fields are required unless `isOptional`; a switch is a choice, so it is optional.
export const settingsFields = [
  { inputType: "text", name: "name", label: "displayName", maxlength: 60 },
  { inputType: "select", name: "bridge", label: "bridge", options: [{ value: "lxdbr0", label: "lxdbr0" }, { value: "ovn-1", label: "ovn-1" }] },
  { inputType: "switch", name: "ipv6", label: "ipv6", isOptional: true },
  { inputType: "number", name: "maxInstances", label: "maxInstances", min: 1, max: 100, step: 1 },
  { inputType: "switch", name: "snapshots", label: "snapshots", isOptional: true },
] as const;

export function readSettings(value: string | undefined): Settings {
  if (!value || value.length > 1000) return defaults;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== "object") return defaults;
    const record = data as Record<string, unknown>;
    if (typeof record.name !== "string" || !record.name.trim() || record.name.length > 60 ||
        (record.bridge !== "lxdbr0" && record.bridge !== "ovn-1") ||
        typeof record.ipv6 !== "boolean" || typeof record.snapshots !== "boolean" ||
        typeof record.maxInstances !== "string" || !validMaximum(record.maxInstances)) return defaults;
    return { name: record.name, bridge: record.bridge, ipv6: record.ipv6, snapshots: record.snapshots, maxInstances: record.maxInstances };
  } catch { return defaults; }
}
export function validMaximum(value: string): boolean {
  return /^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 100;
}
/** The posted maximum as the number field's value: `null` when empty or not a number, so the field shows it empty. */
export function readMaximum(value: string): number | null {
  const maximum = value.trim() === "" ? Number.NaN : Number(value);
  return Number.isFinite(maximum) ? maximum : null;
}
