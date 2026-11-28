import { releases } from "./constants";
import type { Instance } from "./types";

/** Whether `value` is a well-formed demo instance. */
export function isValidInstance(value: unknown): value is Instance {
  if (!value || typeof value !== "object") return false;
  const instance = value as Record<string, unknown>;
  return (
    typeof instance.name === "string" &&
    /^[a-z0-9][a-z0-9-]{0,39}$/.test(instance.name) &&
    typeof instance.release === "string" &&
    releases.some((release) => release === instance.release) &&
    typeof instance.pro === "boolean" &&
    typeof instance.cloudInit === "string" &&
    instance.cloudInit.length <= 1000
  );
}

/** Reads the demo instances from their cookie; a malformed cookie reads as none. */
export function readInstances(cookie: string | undefined): Instance[] {
  if (!cookie || cookie.length > 3000) return [];
  try {
    const parsed: unknown = JSON.parse(cookie);
    if (
      !Array.isArray(parsed) ||
      parsed.length > 10 ||
      !parsed.every(isValidInstance)
    )
      return [];
    if (new Set(parsed.map((instance) => instance.name)).size !== parsed.length)
      return [];
    return parsed.map(({ name, release, pro, cloudInit }) => ({
      name,
      release,
      pro,
      cloudInit,
    }));
  } catch {
    return [];
  }
}

/** Whether `name` is already taken by one of the demo instances. */
export function isNameTaken(
  name: string,
  instances: readonly Instance[],
): boolean {
  return instances.some((instance) => instance.name === name);
}
