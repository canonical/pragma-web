/** A container, as LXD lists one: it runs from an image. */
export type Container = {
  readonly id: string;
  readonly name: string;
  readonly type: "container";
  readonly image: string;
  readonly host: { readonly region: string };
};

/** A virtual machine, as LXD lists one: it is given cores. */
export type VirtualMachine = {
  readonly id: string;
  readonly name: string;
  readonly type: "vm";
  readonly cores: number;
  readonly host: { readonly region: string };
};

/** One LXD instance: a container or a virtual machine. */
export type Workload = Container | VirtualMachine;
