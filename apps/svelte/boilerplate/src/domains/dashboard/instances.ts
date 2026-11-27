export const releases = ["noble", "jammy", "focal"] as const;
export type Release = (typeof releases)[number];
/** The release choices, as the `/api/releases` endpoint serves them to the create form. */
export const releaseOptions: { value: Release; label: string }[] = [
  { value: "noble", label: "Ubuntu 24.04 LTS" },
  { value: "jammy", label: "Ubuntu 22.04 LTS" },
  { value: "focal", label: "Ubuntu 20.04 LTS" },
];
export type Instance = { name: string; release: Release; pro: boolean; cloudInit: string };

export function validInstance(value: unknown): value is Instance {
  if (!value || typeof value !== "object") return false;
  const instance = value as Record<string, unknown>;
  return typeof instance.name === "string" && /^[a-z0-9][a-z0-9-]{0,39}$/.test(instance.name) &&
    typeof instance.release === "string" && releases.some((release) => release === instance.release) &&
    typeof instance.pro === "boolean" && typeof instance.cloudInit === "string" && instance.cloudInit.length <= 1000;
}

export function readInstances(cookie: string | undefined): Instance[] {
  if (!cookie || cookie.length > 3000) return [];
  try {
    const parsed: unknown = JSON.parse(cookie);
    if (!Array.isArray(parsed) || parsed.length > 10 || !parsed.every(validInstance)) return [];
    if (new Set(parsed.map((instance) => instance.name)).size !== parsed.length) return [];
    return parsed.map(({ name, release, pro, cloudInit }) => ({ name, release, pro, cloudInit }));
  } catch { return []; }
}

/** Whether `name` is already taken by one of the demo instances. */
export function isNameTaken(name: string, instances: readonly Instance[]): boolean {
  return instances.some((instance) => instance.name === name);
}
