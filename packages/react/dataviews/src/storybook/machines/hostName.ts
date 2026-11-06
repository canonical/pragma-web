import type { Machine } from "./types.js";

/** Names a machine for its selection checkbox: by host. */
export default function hostName(row: Machine): string {
  return row.name;
}
