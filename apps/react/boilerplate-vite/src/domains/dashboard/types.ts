/** A virtual machine or container, as the dashboard lists it. */
export interface Instance {
  /** Unique name, which also identifies the instance in the list. */
  readonly name: string;
  /** Lifecycle state, shown as a status line. */
  readonly status: "Running" | "Stopped" | "Starting";
  /** The Ubuntu release the instance was launched from. */
  readonly release: string;
  /** Address on the default bridge; empty while the instance is stopped. */
  readonly ipv4: string;
  /** Memory limit, as a display string. */
  readonly memory: string;
}

/** An Ubuntu release offered on the overview. */
export interface Release {
  readonly name: string;
  readonly summary: string;
  /** Channel and kernel, shown as secondary text. */
  readonly detail: string;
}

/** One entry of the activity feed. */
export interface ActivityEvent {
  readonly key: string;
  readonly actor: string;
  readonly datetime: string;
  readonly text: string;
  /** Status of the event, mapped onto the timeline's criticality. */
  readonly criticality?: "success" | "warning" | "error";
}
