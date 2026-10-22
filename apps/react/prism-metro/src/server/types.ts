import type { PreparedRelayData } from "@canonical/prism-core";

/** The initial data a server render embeds for the client to hydrate from. */
export interface InitialData extends Record<string, unknown> {
  /** The request's path and query string. */
  readonly url?: string;
  /** Colour-scheme preference resolved from the request cookie, if any. */
  readonly theme?: "light" | "dark";
  /**
   * The Relay hydration payload from the server's prepare step: the
   * serialised record map of the route's warmed operations, omitted when
   * the step prepared nothing.
   */
  readonly relay?: PreparedRelayData;
}
