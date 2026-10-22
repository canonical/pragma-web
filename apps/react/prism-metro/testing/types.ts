/** One request the metro graph received, as it was put on the wire. */
export interface MetroGraphRequest {
  /** The HTTP method. */
  readonly method: string;
  /** The request's headers, as Node parsed them. */
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  /** The raw body, as sent. */
  readonly body: string;
}

/** A running metro graph (see `startMetroGraph`). */
export interface MetroGraph {
  /** The graph's GraphQL endpoint, on an OS-assigned loopback port. */
  readonly url: string;
  /**
   * Every request received, in arrival order. A test empties it between
   * cases by setting its `length` to 0.
   */
  readonly requests: MetroGraphRequest[];
  /** Stop listening; resolves once the socket is closed. */
  readonly close: () => Promise<void>;
}
