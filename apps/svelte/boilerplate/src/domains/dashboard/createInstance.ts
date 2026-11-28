import { RELEASE_OPTIONS } from "./constants.js";
import type { Instance } from "./types.js";

/**
 * Builds the instance a submitted create form describes, or `undefined` when
 * the form has no name. A new instance is starting and has no address yet.
 */
export default function createInstance(
  data: Readonly<Record<string, unknown>>,
): Instance | undefined {
  const name = typeof data.instance_name === "string" ? data.instance_name : "";

  if (!name.trim()) {
    return undefined;
  }

  const release = RELEASE_OPTIONS.find(
    (option) => option.value === data.release,
  );

  return {
    name,
    status: "starting",
    release: release?.label ?? String(data.release ?? ""),
    ipv4: "",
    memoryGib: 4,
  };
}
