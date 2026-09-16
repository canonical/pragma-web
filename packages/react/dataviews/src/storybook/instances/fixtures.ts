/**
 * The instance collection the polymorphic stories render: records of two
 * types, containers and virtual machines, with a field scoped to each, as
 * a machine-hosting service lists them. Story-only.
 */

import {
  createArraySource,
  createCollection,
  type SortTerm,
  type Source,
} from "@canonical/dataviews-core";

/** What an instance carries whichever type it is. */
type InstanceBase = {
  readonly id: string;
  readonly name: string;
  readonly status: "running" | "stopped" | "frozen";
  readonly project: string;
};

/** A container: it runs from an image, and boots no firmware. */
export type Container = InstanceBase & {
  readonly type: "container";
  readonly image: string;
};

/** A virtual machine: it boots firmware, and runs from no image. */
export type VirtualMachine = InstanceBase & {
  readonly type: "virtual-machine";
  readonly firmware: "bios" | "uefi";
};

/** One instance record, of either type. */
export type Instance = Container | VirtualMachine;

/**
 * The instance collection: `type` names each record's own type, `image`
 * applies to containers alone and `firmware` to virtual machines alone.
 */
export const instanceCollection = createCollection({
  identify: (instance: Instance) => instance.id,
  fields: [
    { field: "name", kind: "text" },
    {
      field: "type",
      kind: "choices",
      options: ["container", "virtual-machine"],
    },
    {
      field: "status",
      kind: "choices",
      options: ["running", "stopped", "frozen"],
    },
    { field: "project", kind: "text" },
    { field: "image", kind: "text", appliesTo: ["container"] },
    {
      field: "firmware",
      kind: "choices",
      options: ["bios", "uefi"],
      appliesTo: ["virtual-machine"],
    },
  ],
  discriminator: "type",
});

/** The fields of the instance collection, for typed columns and sort terms. */
export type InstanceFields = typeof instanceCollection.schema.fields;

const container = (
  id: string,
  name: string,
  image: string,
  status: InstanceBase["status"] = "running",
  project = "default",
): Container => ({ id, name, type: "container", status, project, image });

const virtualMachine = (
  id: string,
  name: string,
  firmware: VirtualMachine["firmware"],
  status: InstanceBase["status"] = "running",
  project = "default",
): VirtualMachine => ({
  id,
  name,
  type: "virtual-machine",
  status,
  project,
  firmware,
});

/**
 * The instances every polymorphic story shows: both types interleaved, so an
 * ordering by a scoped field has to place the records it does not apply to
 * among the ones it does, and one container with no image named, so a field
 * that is empty stands beside one that does not apply.
 */
export const instances: readonly Instance[] = Object.freeze([
  container("i-01", "web-01", "ubuntu:24.04"),
  virtualMachine("i-02", "db-01", "uefi", "running", "data"),
  container("i-03", "cache-01", "alpine:3.20", "stopped"),
  virtualMachine("i-04", "build-01", "bios", "stopped", "ci"),
  container("i-05", "proxy-01", "ubuntu:22.04"),
  virtualMachine("i-06", "win-01", "uefi", "frozen", "desktops"),
  container("i-07", "scratch-01", "", "stopped"),
  container("i-08", "web-02", "ubuntu:24.04"),
  virtualMachine("i-09", "gpu-01", "uefi", "running", "ml"),
  container("i-10", "log-01", "alpine:3.20", "running", "ops"),
]);

/** How a story's instance source is set up. */
export type InstanceSourceConfig = {
  readonly rows?: readonly Instance[] | undefined;
  readonly defaultSort?: readonly SortTerm<InstanceFields[number]["field"]>[];
};

/** The instances over a local array, filtering, searching and ordering by every field. */
export const createInstanceSource = ({
  rows = instances,
  defaultSort,
}: InstanceSourceConfig = {}): Source<Instance> =>
  createArraySource({
    rows,
    collection: instanceCollection,
    searchFields: ["name", "project"],
    ...(defaultSort === undefined ? {} : { defaultSort }),
  });

/**
 * A source whose page carries a record of a type the collection does not
 * declare, as a server that added a type would send it. Spelled through the
 * record type deliberately: the collection can name nothing about it, which
 * is what the page refuses.
 */
export const createUndeclaredTypeSource = (): Source<Instance> =>
  createInstanceSource({
    rows: [
      ...instances,
      {
        id: "i-99",
        name: "odd-01",
        type: "sandbox",
        status: "running",
        project: "default",
      } as unknown as Instance,
    ],
  });
