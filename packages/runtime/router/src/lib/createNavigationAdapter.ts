import type {
  PlatformAdapter,
  PlatformNavigateOptions,
  PlatformSubscribeOptions,
} from "./types.js";

interface NavigationResultLike {
  readonly committed?: Promise<unknown>;
  readonly finished?: Promise<unknown>;
}

interface NavigationLike {
  readonly currentEntry: { readonly url: string | null } | null;
  navigate(
    url: string,
    options?: { history?: "push" | "replace" },
  ): NavigationResultLike | undefined;
  addEventListener(
    type: "navigate",
    listener: (event: NavigateEventLike) => void,
  ): void;
  removeEventListener(
    type: "navigate",
    listener: (event: NavigateEventLike) => void,
  ): void;
}

interface NavigateEventLike {
  readonly navigationType: string;
  readonly destination: {
    readonly url: string;
    readonly sameDocument?: boolean;
  };
  readonly canIntercept: boolean;
  readonly hashChange: boolean;
  readonly downloadRequest: string | null;
  readonly sourceElement?: { closest(selector: string): unknown } | null;
  intercept(options?: NavigationInterceptOptionsLike): void;
}

interface NavigationInterceptOptionsLike {
  readonly handler?: () => void | Promise<void>;
  readonly focusReset?: "after-transition" | "manual";
  readonly scroll?: "after-transition" | "manual";
}

interface NavigationWindowLike {
  readonly navigation: NavigationLike;
  readonly location: { readonly href: string };
}

/**
 * Intentional no-op `.catch()` handler for the Navigation API's transition
 * promises.
 *
 * `navigation.navigate()` returns a `{ committed, finished }` promise pair;
 * either can reject when a navigation is superseded, aborted, or immediately
 * cancelled.  Those rejections are harmless to the router — subscribers were
 * already notified and a superseding navigation carries its own notification —
 * so this handler only prevents unhandled promise rejections without
 * swallowing errors that matter.
 */
function ignoreNavigationTransitionError(_error: unknown): void {}

function getDefaultNavigationWindow(): NavigationWindowLike {
  const win = globalThis as { window?: NavigationWindowLike };

  if (!win.window || !("navigation" in win.window)) {
    throw new Error(
      "Navigation adapter requires a window with the Navigation API.",
    );
  }

  return win.window;
}

/** Create a Navigation API adapter using `window.navigation`. */
export default function createNavigationAdapter(
  navigationWindow: NavigationWindowLike = getDefaultNavigationWindow(),
): PlatformAdapter {
  const subscribers = new Map<
    (location: string | URL) => void,
    PlatformSubscribeOptions | undefined
  >();
  const navigation = navigationWindow.navigation;
  let trackedLoad: Promise<void> | null = null;
  /** True while this adapter's own `navigate()` is calling the Navigation
   * API, whose `navigate` event fires synchronously inside that call. */
  let navigatingForRouter = false;

  function getLocation(): URL {
    return new URL(navigationWindow.location.href);
  }

  function notify(location: URL = getLocation()): void {
    for (const subscriber of subscribers.keys()) {
      subscriber(new URL(location.href));
    }
  }

  function handleNavigate(event: NavigateEventLike): void {
    if (
      !event.canIntercept ||
      event.hashChange ||
      event.downloadRequest !== null
    ) {
      return;
    }

    const destination = new URL(event.destination.url);

    // Leave new document requests outside the client route map to the server.
    // A 404 fallback is not a route. An explicit opt-out also covers endpoints
    // whose paths overlap a client route (for example because of a catch-all).
    if (
      !navigatingForRouter &&
      (event.navigationType === "push" || event.navigationType === "replace")
    ) {
      if (event.sourceElement?.closest("a[data-router-native]")) {
        return;
      }

      if (!event.destination.sameDocument) {
        let hasRouteMatcher = false;
        let matched = false;

        for (const options of subscribers.values()) {
          if (options?.matchesRoute) {
            hasRouteMatcher = true;

            if (options.matchesRoute(destination)) {
              matched = true;
              break;
            }
          }
        }

        if (hasRouteMatcher && !matched) {
          return;
        }
      }
    }

    // Intercept router-owned navigations to prevent full page reloads.
    // The router handles the URL update and re-render internally.  The
    // handler hands the browser the router's in-flight load (tracked via
    // trackLoad below), so native loading UI reflects the navigation.  It
    // reads trackedLoad at call time — the router tracks the load
    // synchronously during the navigate event (via notify() here, or right
    // after its own navigation.navigate() call), and intercept handlers run
    // on a later microtask.  A failed load still commits router state, so
    // the handler never rejects — it must not mark the browser navigation
    // as failed.
    //
    // A navigation the router asked for leaves scroll and focus to the
    // router.  Left to the browser, an intercepted push or replace scrolls
    // to the top and moves focus to <body> once the handler settles — also
    // for `setSearchParams()`, where the router deliberately leaves the
    // reader where they are — and would repeat what the router's own
    // ScrollManager and FocusManager already did for a real navigation.
    // That also matches the History API adapter, where the browser does
    // neither.  Navigations the browser starts (back/forward, reload, a link
    // the router did not start) keep the browser's defaults.
    event.intercept({
      handler: () =>
        Promise.resolve(trackedLoad).then(
          () => undefined,
          ignoreNavigationTransitionError,
        ),
      ...(navigatingForRouter
        ? { focusReset: "manual", scroll: "manual" }
        : undefined),
    });

    // Notify for every navigation the router did not start itself, so a
    // plain link, Back/Forward or a reload loads its route.  The event's
    // destination is the address being navigated to: `location.href` still
    // names the page being left during the event.  A navigation the router
    // asked for is notified by navigate() after navigation.navigate()
    // returns, when location.href already names the destination.
    if (!navigatingForRouter) {
      notify(destination);
    }
  }

  return {
    getLocation() {
      return getLocation();
    },
    navigate(url, navigationOptions?: PlatformNavigateOptions) {
      navigatingForRouter = true;

      let result: NavigationResultLike | undefined;

      try {
        result = navigation.navigate(url, {
          history: navigationOptions?.replace ? "replace" : "push",
        });
      } finally {
        navigatingForRouter = false;
      }

      result?.committed?.catch(ignoreNavigationTransitionError);
      result?.finished?.catch(ignoreNavigationTransitionError);

      notify();
    },
    trackLoad(load) {
      trackedLoad = load;
    },
    subscribe(callback, options) {
      const shouldAttachListener = subscribers.size === 0;

      subscribers.set(callback, options);

      if (shouldAttachListener) {
        navigation.addEventListener("navigate", handleNavigate);
      }

      return () => {
        subscribers.delete(callback);

        if (subscribers.size === 0) {
          navigation.removeEventListener("navigate", handleNavigate);
        }
      };
    },
  };
}
