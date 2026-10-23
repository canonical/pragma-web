import type { EntityBinding } from "@canonical/prism-core";
import type { ReactNode } from "react";
import type {
  Environment,
  FetchFunction,
  GraphQLResponse,
  Variables,
} from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import type { Mock } from "vitest";

/** One request a provider answered, and its answer. */
export interface RecordedResponse {
  /** The operation's name. */
  readonly operation: string;
  /** The variables it ran with. */
  readonly variables: Variables;
  /** The provider's JSON answer. */
  readonly response: GraphQLResponse;
}

/** Options for `createRecordedFetch`. */
export interface RecordedFetchOptions {
  /**
   * The size of the index's first page, in place of the lens's own, so the
   * "Load more" path runs against the metro graph's sixteen stations. Only
   * `EntityIndexQuery`'s `count` is lowered; the pagination query asks for
   * the lens's own page size.
   */
  readonly cap?: number;
}

/** A warmed environment and the recorded fetch behind it. */
export interface WarmEnvironment {
  /** The environment, its store holding what the route's warm fetched. */
  readonly environment: Environment;
  /** The fetch function, its call log cleared after the warm. */
  readonly fetchFn: Mock<FetchFunction>;
}

/** The layout `createEntitySite` wraps the content in, and the site's slots
 * it binds. */
export interface EntitySiteLayout {
  /** The binding whose routes the layout wraps. */
  readonly binding: EntityBinding;
  /** The lens's label. */
  readonly label: string;
  /** The site's rail; none when omitted. */
  readonly rail?: ReactNode;
  /** The site's footer band, if any. */
  readonly colophon?: ReactNode;
  /** Class names the site adds to the layout's root. */
  readonly className?: string;
}

/** What `createEntitySite` mounts. */
export interface EntitySiteSetup {
  /** The URL the router starts at. */
  readonly url: string;
  /** The Relay environment the site reads from. */
  readonly environment: Environment;
  /** The content; the matched route's, through the router's outlet, when
   * omitted. */
  readonly children?: ReactNode;
  /** The lens layout to wrap the content in; none when omitted. */
  readonly layout?: EntitySiteLayout;
  /**
   * Whether the router navigates, over a memory history, so a search
   * parameter the page writes reaches the address; a static router, as the
   * server renders with, when omitted.
   */
  readonly navigable?: boolean;
}

/** What a server render of one page hands the client. */
export interface ServerMarkup {
  /** The page's markup. */
  readonly html: string;
  /** The serialised store the markup was rendered from. */
  readonly records: RecordMap;
  /** How many requests the render made once the warm had settled. */
  readonly requestsAfterWarm: number;
}
