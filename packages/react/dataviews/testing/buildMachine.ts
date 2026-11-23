import type { Machine } from "./types.js";

/** One machine record of the given identity and name, in one region and owner. */
export default function buildMachine(
  id: string,
  name: string,
  status: Machine["status"] = "running",
  cores = 4,
): Machine {
  return {
    id,
    name,
    status,
    cores,
    region: "eu-west-1",
    owner: "ex:ana",
    note: "",
  };
}
