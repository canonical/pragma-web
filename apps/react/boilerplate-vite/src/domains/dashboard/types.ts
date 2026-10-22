import type { MessageKey } from "#i18n/en.js";

/** An instance's lifecycle state; its label comes from the catalogs. */
export type InstanceStatus = "running" | "stopped" | "starting";

/** A virtual machine or container, as the dashboard lists it. */
export interface Instance {
  /** Unique name, which also identifies the instance in the list. */
  readonly name: string;
  readonly status: InstanceStatus;
  /** The Ubuntu release the instance was launched from, by its product name. */
  readonly release: string;
  /** Address on the default bridge; empty while the instance is stopped. */
  readonly ipv4: string;
  /** Memory limit, in gibibytes. */
  readonly memoryGib: number;
}

/** An Ubuntu release offered on the overview. */
export interface Release {
  /** The product name, which is not translated. */
  readonly name: string;
  /** The catalog key of the release's one-line description. */
  readonly summaryKey: MessageKey;
  readonly channel: "stable" | "beta";
  readonly kernel: string;
}

/** One entry of the activity feed. */
export interface ActivityEvent {
  readonly key: string;
  /**
   * Who acted: a person's name, shown as is, or the catalog key of a system
   * actor such as the scheduler.
   */
  readonly actor: { readonly name: string } | { readonly key: MessageKey };
  /** How long ago it happened, in minutes; shown as a relative time. */
  readonly minutesAgo: number;
  /** The catalog key of the event's text, and the values it interpolates. */
  readonly messageKey: MessageKey;
  readonly values: Readonly<Record<string, string>>;
  /** Status of the event, mapped onto the timeline's criticality. */
  readonly criticality?: "success" | "warning" | "error";
}
