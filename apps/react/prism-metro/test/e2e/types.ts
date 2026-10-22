/**
 * A spawned server under test.
 */
export interface RunningServer {
  /** Base URL, e.g. `http://localhost:54123`. */
  readonly base: string;
  /** Stop the server and its whole process group. */
  readonly stop: () => Promise<void>;
}

/** Options for `startServer`. */
export interface StartServerOptions {
  /** How long the server may take to answer its first request. */
  readonly timeoutMs?: number;
  /** Extra environment variables for the script. */
  readonly env?: Readonly<Record<string, string>>;
  /** The variable the script reads its port from. */
  readonly portEnv?: string;
  /**
   * The host the server is probed and addressed on. A server bound to the
   * IPv4 loopback alone must be probed at `127.0.0.1`, because `localhost`
   * may resolve to `::1` first.
   */
  readonly hostname?: string;
}
