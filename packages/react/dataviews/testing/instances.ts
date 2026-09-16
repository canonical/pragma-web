/**
 * The instance collection the polymorphic tests share: records
 * of two types, containers and virtual machines, with a field scoped to
 * each, and a provider over a manual source the test answers.
 *
 * The machine collection is monomorphic, so nothing there exercises a field
 * a record's type does not carry; this one does.
 */

import {
  type CapabilityDeclaration,
  type Collection,
  createCollection,
  createDataViewsProvider,
  type DataViewsProvider,
  declareCapabilities,
  type QueryLocation,
  type SourceCapabilities,
} from "@canonical/dataviews-core";
import createManualSource from "./createManualSource.js";
import { COUNTED_EXACTLY, pageOf } from "./fixtures.js";
import type { ManualSource, ManualSourceConfig } from "./types.js";

/** What an instance carries whichever type it is. */
type InstanceBase = {
  readonly id: string;
  readonly name: string;
  readonly status: "running" | "stopped";
};

/** A container: it runs from an image, and boots no firmware. */
type Container = InstanceBase & {
  readonly type: "container";
  readonly image: string;
};

/** A virtual machine: it boots firmware, and runs from no image. */
type VirtualMachine = InstanceBase & {
  readonly type: "virtual-machine";
  readonly firmware: "bios" | "uefi";
};

/** One instance record, of either type. */
export type Instance = Container | VirtualMachine;

/**
 * The instance collection every polymorphic test mounts over: `type` names
 * each record's own type, `image` applies to containers alone and
 * `firmware` to virtual machines alone.
 */
export const instances = createCollection({
  identify: (instance: Instance) => instance.id,
  fields: [
    { field: "name", kind: "text" },
    {
      field: "type",
      kind: "choices",
      options: ["container", "virtual-machine"],
    },
    { field: "status", kind: "choices", options: ["running", "stopped"] },
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

/** The fields of the instance collection, for typed handles and providers. */
export type InstanceFields = typeof instances.schema.fields;

/** One container of the given identity and name. */
export const container = (
  id: string,
  name: string,
  image = "ubuntu:24.04",
  status: InstanceBase["status"] = "running",
): Container => ({ id, name, type: "container", status, image });

/** One virtual machine of the given identity and name. */
export const virtualMachine = (
  id: string,
  name: string,
  firmware: VirtualMachine["firmware"] = "uefi",
  status: InstanceBase["status"] = "running",
): VirtualMachine => ({ id, name, type: "virtual-machine", status, firmware });

/**
 * A fleet of both types, interleaved so neither type is a contiguous block:
 * an ordering by a scoped field has to place the records the field does not
 * apply to among the ones it does.
 */
export const MIXED_FLEET: readonly Instance[] = Object.freeze([
  container("i-1", "web-01", "ubuntu:24.04"),
  virtualMachine("i-2", "db-01", "uefi", "stopped"),
  container("i-3", "cache-01", "alpine:3.20", "stopped"),
  virtualMachine("i-4", "build-01", "bios"),
]);

/** What the fixture source declares: it filters, searches, orders and counts. */
const INSTANCE_CAPABILITIES: SourceCapabilities = declareCapabilities(
  instances,
  {
    filter: {
      type: ["isAny"],
      status: ["isAny"],
      image: ["contains"],
      firmware: ["isAny"],
    },
    search: ["name"],
    counts: COUNTED_EXACTLY,
    sort: {
      fields: ["name", "status", "image"],
      terms: 2,
      tiebreak: "opaque",
    },
  } satisfies CapabilityDeclaration<InstanceFields>,
);

/** How one test's instance provider is set up. */
export type InstanceProviderConfig = Omit<
  ManualSourceConfig<Instance>,
  "capabilities"
> & {
  readonly capabilities?: SourceCapabilities | undefined;
  /** The rows every request is answered with at once; by hand when left out. */
  readonly rows?: readonly Instance[] | undefined;
  readonly location?: QueryLocation | undefined;
};

/** The provider the polymorphic tests drive. */
type InstanceProvider = DataViewsProvider<InstanceFields, Instance>;

/** An instance provider over a manual source, with the source to answer it. */
type InstanceFixture = {
  readonly provider: InstanceProvider;
  readonly collection: Collection<InstanceFields, Instance>;
  readonly source: ManualSource<Instance>;
};

/**
 * A provider over the instance collection and a manual source. Given `rows`,
 * every request is answered at once with them; otherwise the test delivers
 * through the source after the component's effect has observed the provider.
 */
export const createInstanceProvider = ({
  rows,
  capabilities = INSTANCE_CAPABILITIES,
  location,
  ...rest
}: InstanceProviderConfig = {}): InstanceFixture => {
  const source = createManualSource<Instance>({
    ...rest,
    capabilities,
    ...(rows === undefined ? {} : { answer: () => pageOf(rows) }),
  });
  const provider = createDataViewsProvider({
    collection: instances,
    source: source.source,
    ...(location === undefined ? {} : { location }),
  });
  return { provider, collection: instances, source };
};
