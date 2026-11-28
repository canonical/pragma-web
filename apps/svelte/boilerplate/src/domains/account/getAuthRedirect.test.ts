import { describe, expect, it } from "vitest";
import getAuthRedirect from "./getAuthRedirect.js";

const url = (path: string) => new URL(path, "http://localhost");

describe("getAuthRedirect", () => {
  it("sends a protected page without ?auth=1 to the login page", () => {
    expect(getAuthRedirect(url("/account"))).toBe("/login?from=%2Faccount");
  });

  it("lets a protected page with ?auth=1 render", () => {
    expect(getAuthRedirect(url("/account?auth=1"))).toBeNull();
  });

  it("lets a public page render", () => {
    expect(getAuthRedirect(url("/catalog"))).toBeNull();
  });
});
