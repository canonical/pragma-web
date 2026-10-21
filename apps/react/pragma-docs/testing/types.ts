/** One request a graph stub captured: what was actually put on the wire. */
export interface CapturedRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly body: Record<string, unknown>;
}

/** A running graph stub (see `startGraphStub`). */
export interface GraphStub {
  /** The stub's GraphQL endpoint, on an OS-assigned loopback port. */
  readonly url: string;
  /**
   * Every request received, in arrival order. Tests empty it between cases
   * by setting its `length` to 0.
   */
  readonly captured: CapturedRequest[];
  /** Stop listening; resolves once the socket is closed. */
  readonly close: () => Promise<void>;
}

/** How many times a tracked component has mounted and unmounted (see
 * `trackMounts`). */
export interface MountCount {
  mounts: number;
  unmounts: number;
}
