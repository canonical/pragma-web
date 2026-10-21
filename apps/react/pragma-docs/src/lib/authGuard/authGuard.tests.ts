// @vitest-environment node

/**
 * Both halves of the guard.
 *
 * The server half, which is the half that used to be unreachable: `withAuth`
 * runs from the route's asynchronous `warm` hook, and SSR matches and renders
 * synchronously without awaiting it, so a hard `GET /account` rendered the
 * protected page while an in-app navigation to the same URL redirected. The
 * four HTTP entry points now ask `getAuthRedirectHref` before they render,
 * and the first block holds its answers.
 *
 * The client half: the `warm` that `withAuth` wraps around a protected
 * route, which redirects an unauthenticated navigation and otherwise hands
 * over to the route's own `warm`.
 */

import {
  type AnyRoute,
  type NavigationContext,
  Redirect,
  route,
} from "@canonical/router-core";
import { describe, expect, it, vi } from "vitest";
import { getAuthRedirectHref, withAuth } from "./authGuard.js";

/** The navigation context a router hands every `warm`. */
const CONTEXT: NavigationContext = { signal: new AbortController().signal };

/**
 * Call `invoke` and return what it threw.
 *
 * @param invoke - The call expected to throw.
 * @returns The thrown value.
 * @throws When `invoke` returns instead of throwing.
 */
const readThrown = (invoke: () => unknown): unknown => {
  try {
    invoke();
  } catch (thrown) {
    return thrown;
  }
  throw new Error("Expected the call to throw.");
};

describe("getAuthRedirectHref", () => {
  it("sends an unauthenticated request for a protected path to the login page", () => {
    expect(getAuthRedirectHref("/account")).toBe("/login?from=%2Faccount");
  });

  it("lets an authenticated request through", () => {
    expect(getAuthRedirectHref("/account?auth=1")).toBeNull();
  });

  it("leaves unprotected paths alone", () => {
    expect(getAuthRedirectHref("/components")).toBeNull();
    expect(getAuthRedirectHref("/")).toBeNull();
  });

  it("reads an absolute URL as well as a path", () => {
    expect(getAuthRedirectHref(new URL("https://docs.example/account"))).toBe(
      "/login?from=%2Faccount",
    );
  });

  it("does not accept an auth value other than the demo one", () => {
    // The credential is `?auth=1` and nothing else — the demo the scaffold
    // ships and the login page documents. Any other value is not a session.
    expect(getAuthRedirectHref("/account?auth=0")).toBe(
      "/login?from=%2Faccount",
    );
    expect(getAuthRedirectHref("/account?auth=true")).toBe(
      "/login?from=%2Faccount",
    );
  });
});

describe("withAuth", () => {
  it("leaves an unprotected route as it is", () => {
    const components = route({ url: "/components", content: () => null });

    expect(withAuth("/login")(components)).toBe(components);
  });

  it("redirects an unauthenticated warm to the login page", () => {
    const ownWarm = vi.fn();
    const account: AnyRoute = withAuth("/login")(
      route({ url: "/account", content: () => null, warm: ownWarm }),
    );

    const thrown = readThrown(() => account.warm?.({}, {}, CONTEXT));

    expect(thrown).toBeInstanceOf(Redirect);
    expect(thrown).toMatchObject({
      to: "/login?from=%2Faccount",
      status: 302,
    });
    expect(ownWarm).not.toHaveBeenCalled();
  });

  it("hands an authenticated warm to the route's own warm", () => {
    const ownWarm = vi.fn();
    const account: AnyRoute = withAuth("/login")(
      route({ url: "/account", content: () => null, warm: ownWarm }),
    );

    account.warm?.({}, { auth: "1" }, CONTEXT);

    expect(ownWarm).toHaveBeenCalledWith({}, { auth: "1" }, CONTEXT);
  });
});
