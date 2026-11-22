/** What `useRecentPages` reads of the site's router. */
export interface RecentPagesRouter {
  /** Calls `listener` on each change of the router's state. */
  readonly subscribe: (listener: () => void) => () => void;
  /** The router's state, of which the location's URL is read. */
  readonly getState: () => { readonly location: { readonly url: URL } };
}
