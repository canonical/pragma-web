import type { Machine } from "./types.js";

/** One machine record of the given identity and name. */
export default function buildMachine(
  id: string,
  name: string,
  status: Machine["status"] = "running",
  cores = 4,
): Machine {
  return { id, name, status, cores };
}
