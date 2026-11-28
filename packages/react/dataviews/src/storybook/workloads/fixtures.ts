/**
 * Story fixtures for an LXD-shaped instance list: containers and virtual
 * machines in one collection, each field scoped to the type that carries
 * it.
 */

import { createCollection } from "@canonical/dataviews-core";
import type { Workload } from "./types.js";

/** Six instances, both types represented. */
export const storyWorkloads: readonly Workload[] = [
  {
    id: "w-1",
    name: "web",
    type: "container",
    image: "ubuntu/24.04",
    host: { region: "eu-west" },
  },
  { id: "w-2", name: "db", type: "vm", cores: 8, host: { region: "eu-west" } },
  {
    id: "w-3",
    name: "cache",
    type: "container",
    image: "alpine/3.20",
    host: { region: "us-east" },
  },
  {
    id: "w-4",
    name: "build",
    type: "vm",
    cores: 16,
    host: { region: "us-east" },
  },
  {
    id: "w-5",
    name: "proxy",
    type: "container",
    image: "debian/12",
    host: { region: "eu-west" },
  },
  { id: "w-6", name: "ci", type: "vm", cores: 4, host: { region: "us-east" } },
];

/**
 * The instance collection: `image` is a container's, `cores` a VM's, and
 * `host.region` a nested field of both.
 */
export const workloadCollection = createCollection({
  identify: (workload: Workload) => workload.id,
  fields: [
    { field: "name", kind: "text" },
    { field: "type", kind: "choices", options: ["container", "vm"] },
    { field: "image", kind: "text", appliesTo: ["container"] },
    { field: "cores", kind: "number", min: 1, appliesTo: ["vm"] },
    { field: "host.region", kind: "text" },
  ],
  discriminator: "type",
});
