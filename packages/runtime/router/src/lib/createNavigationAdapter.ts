import type { PlatformAdapter, PlatformNavigateOptions } from "./types.js";

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
  readonly destination: { readonly url: string };
  readonly canIntercept: boolean;
  readonly hashChange: boolean;
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
  const subscribers = new Set<(location: string | URL) => void>();
  const navigation = navigationWindow.navigation;
  let trackedLoad: Promise<void> | null = null;
  /** True while this adapter's own `navigate()` is calling the Navigation
   * API, whose `navigate` event fires synchronously inside that call. */
  let navigatingForRouter = false;

  function getLocation(): URL {
    return new URL(navigationWindow.location.href);
  }

  /**
   * Hand a location to every subscriber, each its own copy.
   *
   * @note Impure: calls the subscribers, which load and render the route.
   */
  function publish(location: URL): void {
    for (const subscriber of subscribers) {
      subscriber(new URL(location.href));
    }
  }

  function handleNavigate(event: NavigateEventLike): void {
    if (!event.canIntercept || event.hashChange) {
      return;
    }

    // The adapter intercepts two kinds of same-origin navigation, and leaves
    // every other one to the browser:
    //
    // - A navigation the router asked for (its own `navigate()` below).  The
    //   router already loads and renders the route, so the interception only
    //   keeps the browser from loading the document, and leaves scroll and
    //   focus to the router.  Left to the browser, an intercepted push or
    //   replace scrolls to the top and moves focus to <body> once the handler
    //   settles — also for `setSearchParams()`, where the router deliberately
    //   leaves the reader where they are — and would repeat what the router's
    //   own ScrollManager and FocusManager already did.  That matches the
    //   History API adapter, where the browser does neither.
    // - A traversal (back, forward) or a reload.  The router has no other way
    //   to learn of them, so the adapter publishes the destination to its
    //   subscribers and keeps the browser's scroll and focus defaults.
    //
    // A push or replace the router did not start — a plain `<a>`, a form, a
    // `location.assign()` — is not intercepted: the browser loads it as a
    // document, as it does under the History API adapter.  Intercepting it
    // without telling the router would change the URL and leave the old page
    // on screen.
    //
    // The intercept handler hands the browser the router's in-flight load
    // (tracked via trackLoad below), so native loading UI reflects the
    // navigation.  It reads trackedLoad at call time — the router tracks the
    // load synchronously during the navigate event (via publish() here, or
    // right after its own navigation.navigate() call), and intercept handlers
    // run on a later microtask.  A failed load still commits router state, so
    // the handler never rejects — it must not mark the browser navigation as
    // failed.
    const waitForTrackedLoad = () =>
      Promise.resolve(trackedLoad).then(
        () => undefined,
        ignoreNavigationTransitionError,
      );

    if (navigatingForRouter) {
      event.intercept({
        handler: waitForTrackedLoad,
        focusReset: "manual",
        scroll: "manual",
      });
      return;
    }

    if (
      event.navigationType !== "traverse" &&
      event.navigationType !== "reload"
    ) {
      return;
    }

    event.intercept({ handler: waitForTrackedLoad });

    // Inside the navigate event the browser has not committed the new URL
    // yet, so `location.href` still names the entry being left: publish the
    // destination instead.
    publish(new URL(event.destination.url));
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

      publish(getLocation());
    },
    trackLoad(load) {
      trackedLoad = load;
    },
    subscribe(callback) {
      const shouldAttachListener = subscribers.size === 0;

      subscribers.add(callback);

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
